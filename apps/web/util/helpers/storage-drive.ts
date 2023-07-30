import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BucketsOnUsers, Drive, Role } from "@prisma/client";
import { Provider, StorageDrive } from "@util/types";
import { AES, enc } from "crypto-js";

export const createStorageDrive = (drive: Drive, userRole: Role): StorageDrive => {
  const decryptedKeys = JSON.parse(
    AES.decrypt(drive.keys, process.env.CIPHER_KEY).toString(enc.Utf8),
  );

  const permissions = userRole === Role.CREATOR ? "owned" : "shared";

  const s3DriveType = (type: string): "s3" | "backblaze" | "cloudflare" => {
    if (type === "s3" || type === "backblaze" || type === "cloudflare") return type;
    else throw new Error(`Invalid provider type '${type}' found on driveId ${drive.id}`);
  };

  if (drive.type === "firebase") {
    if (permissions === "owned") {
      return {
        id: drive.id,
        createdAt: drive.createdAt,
        name: drive.name,
        type: "firebase",
        permissions: "owned",
        supportsDeletion: true,
        keys: {
          authDomain: decryptedKeys.authDomain,
          storageBucket: decryptedKeys.storageBucket,
          appId: decryptedKeys.appId,
          projectId: decryptedKeys.projectId,
          apiKey: decryptedKeys.apiKey,
        },
      };
    } else {
      return {
        id: drive.id,
        createdAt: drive.createdAt,
        name: drive.name,
        type: "firebase",
        permissions: "shared",
        supportsDeletion: false,
        keys: {
          authDomain: decryptedKeys.authDomain,
          storageBucket: decryptedKeys.storageBucket,
          appId: decryptedKeys.appId,
          projectId: decryptedKeys.projectId,
        },
      };
    }
  } else {
    if (permissions === "owned") {
      return {
        id: drive.id,
        createdAt: drive.createdAt,
        name: drive.name,
        type: s3DriveType(drive.type),
        permissions: "owned",
        supportsDeletion: true,
        performDelete: removeS3File,
        keys: {
          region: decryptedKeys.region,
          bucketUrl: decryptedKeys.bucketUrl,
          Bucket: decryptedKeys.Bucket,
          accessKey: decryptedKeys.accessKey,
          secretKey: decryptedKeys.secretKey,
          ...(decryptedKeys.endpoint ? { endpoint: decryptedKeys.endpoint } : {}),
        },
      };
    } else {
      return {
        id: drive.id,
        createdAt: drive.createdAt,
        name: drive.name,
        type: s3DriveType(drive.type),
        permissions: "shared",
        supportsDeletion: true,
        performDelete: removeS3File,
        keys: {
          region: decryptedKeys.region,
          bucketUrl: decryptedKeys.bucketUrl,
          Bucket: decryptedKeys.Bucket,
        },
      };
    }
  }
};

export const signedUrlExpireSeconds = 60;

export const removeS3File = async (privilegedDrive: StorageDrive, fileFullPath: string) => {
  if (!(privilegedDrive.type !== "firebase") || privilegedDrive.permissions !== "owned") {
    throw new Error(`Drive type '${privilegedDrive.type}' not valid for S3 provider`);
  }
  const adminClient = new S3Client({
    region: privilegedDrive.keys.region,
    maxAttempts: 1,
    credentials: {
      accessKeyId: privilegedDrive.keys.accessKey,
      secretAccessKey: privilegedDrive.keys.secretKey,
    },
    ...(privilegedDrive.keys?.endpoint ? { endpoint: privilegedDrive.keys.endpoint } : {}),
  });

  const signedDeleteUrl = await getSignedUrl(
    adminClient,
    new DeleteObjectCommand({
      Bucket: privilegedDrive.keys.Bucket,
      Key: fileFullPath,
    }),
    {
      expiresIn: signedUrlExpireSeconds,
    },
  );
  return signedDeleteUrl;
};
