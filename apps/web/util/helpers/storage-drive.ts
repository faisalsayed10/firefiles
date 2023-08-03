import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Drive, Role } from "@prisma/client";
import { StorageDrive } from "@util/types";
import { AES, enc } from "crypto-js";

export const createServerDrive = (drive: Drive, userRole: Role): StorageDrive => {
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
        environment: "server",
        supportsDeletion: true,
        supportsGetObject: true,
        supportsListObjects: true,
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
        environment: "server",
        supportsDeletion: false,
        supportsGetObject: false,
        supportsListObjects: false,
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
      const pDrive: StorageDrive = {
        id: drive.id,
        createdAt: drive.createdAt,
        name: drive.name,
        type: s3DriveType(drive.type),
        permissions: "owned",
        environment: "server",
        supportsDeletion: true,
        supportsGetObject: true,
        supportsListObjects: true,
        getDeleteFileUrl: (path: string) => getDeleteS3FileUrl(pDrive, path),
        getObjectUrl: (path: string) => getS3ObjectUrl(pDrive, path),
        getListObjectsUrl: (fullPath: string, continuationToken?: string, delimiter?: string) =>
          getS3ObjectsListUrl(pDrive, fullPath, continuationToken, delimiter),
        keys: {
          region: decryptedKeys.region,
          bucketUrl: decryptedKeys.bucketUrl,
          Bucket: decryptedKeys.Bucket,
          accessKey: decryptedKeys.accessKey,
          secretKey: decryptedKeys.secretKey,
          ...(decryptedKeys.endpoint ? { endpoint: decryptedKeys.endpoint } : {}),
        },
      };
      return pDrive;
    } else {
      const pDrive: StorageDrive = {
        id: drive.id,
        createdAt: drive.createdAt,
        name: drive.name,
        type: s3DriveType(drive.type),
        permissions: "shared",
        environment: "server",
        supportsDeletion: true,
        supportsGetObject: true,
        supportsListObjects: true,
        getDeleteFileUrl: (path: string) => getDeleteS3FileUrl(pDrive, path),
        getObjectUrl: (path: string) => getS3ObjectUrl(pDrive, path),
        getListObjectsUrl: (fullPath: string, continuationToken?: string, delimiter?: string) =>
          getS3ObjectsListUrl(pDrive, fullPath, continuationToken, delimiter),
        keys: {
          region: decryptedKeys.region,
          bucketUrl: decryptedKeys.bucketUrl,
          Bucket: decryptedKeys.Bucket,
        },
      };

      return pDrive;
    }
  }
};

export const createClientDrive = (drive: Drive, userRole: Role): StorageDrive => {
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
        environment: "client",
        supportsDeletion: true,
        supportsGetObject: true,
        supportsListObjects: true,
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
        environment: "client",
        supportsDeletion: false,
        supportsGetObject: false,
        supportsListObjects: false,
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
      const pDrive: StorageDrive = {
        id: drive.id,
        createdAt: drive.createdAt,
        name: drive.name,
        type: s3DriveType(drive.type),
        permissions: "owned",
        environment: "client",
        supportsDeletion: true,
        supportsGetObject: true,
        supportsListObjects: true,
        keys: {
          region: decryptedKeys.region,
          bucketUrl: decryptedKeys.bucketUrl,
          Bucket: decryptedKeys.Bucket,
          accessKey: decryptedKeys.accessKey,
          secretKey: decryptedKeys.secretKey,
          ...(decryptedKeys.endpoint ? { endpoint: decryptedKeys.endpoint } : {}),
        },
      };
      return pDrive;
    } else {
      const pDrive: StorageDrive = {
        id: drive.id,
        createdAt: drive.createdAt,
        name: drive.name,
        type: s3DriveType(drive.type),
        permissions: "shared",
        environment: "client",
        supportsDeletion: true,
        supportsGetObject: true,
        supportsListObjects: true,
        keys: {
          region: decryptedKeys.region,
          bucketUrl: decryptedKeys.bucketUrl,
          Bucket: decryptedKeys.Bucket,
        },
      };

      return pDrive;
    }
  }
};

export const signedUrlExpireSeconds = 3600 * 24;

type listObjectsV2Config = {
  Bucket: string;
  Prefix: string;
  ContinuationToken?: string;
  Delimiter?: string;
};

const getDeleteS3FileUrl = async (privilegedDrive: StorageDrive, fileFullPath: string) => {
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

const getS3ObjectUrl = async (privilegedDrive: StorageDrive, fullPath: string) => {
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

  const signedGetObjectUrl = await getSignedUrl(
    adminClient,
    new GetObjectCommand({
      Bucket: privilegedDrive.keys.Bucket,
      Key: fullPath,
    }),
    { expiresIn: signedUrlExpireSeconds },
  );

  return signedGetObjectUrl;
};

const getS3ObjectsListUrl = async (
  privilegedDrive: StorageDrive,
  fullPath: string,
  continuationToken?: string,
  delimiter?: string,
) => {
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

  const listConfig: listObjectsV2Config = {
    Bucket: privilegedDrive.keys.Bucket,
    Prefix: fullPath,
  };

  if (continuationToken) listConfig.ContinuationToken = continuationToken;
  if (delimiter) listConfig.Delimiter = delimiter;

  const signedGetObjectUrl = await getSignedUrl(adminClient, new ListObjectsV2Command(listConfig), {
    expiresIn: signedUrlExpireSeconds,
  });

  return signedGetObjectUrl;
};