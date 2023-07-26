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
    else throw new Error("Invalid provider type found on drive");
  };

  if (drive.type === "firebase") {
    if (permissions === "owned") {
      return {
        id: drive.id,
        createdAt: drive.createdAt,
        name: drive.name,
        type: "firebase",
        permissions: "owned",
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
        keys: {
          region: decryptedKeys.region,
          bucketUrl: decryptedKeys.bucketUrl,
          Bucket: decryptedKeys.Bucket,
        },
      };
    }
  }
};
