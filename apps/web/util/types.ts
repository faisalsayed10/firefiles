import { FirebaseOptions } from "firebase/app";

export type UploadingFile = {
  id: string;
  name: string;
  key?: string;
  progress: number;
  error: boolean;
  task: {
    cancel: (...args) => void;
    pause: (...args) => void;
    resume: (...args) => void;
  };
  state: string;
};

export type Config = FirebaseOptions & { password?: string };

export enum Provider {
  firebase,
  s3,
  minio,
  backblaze,
  deta,
  git,
  cloudflare,
}

export type FileSortConfig = {
  property: "name" | "size" | "createdAt";
  isAscending: boolean;
};

export type DriveFile = {
  name: string;
  url?: string;
  parent: string;
  fullPath: string;
  bucketName?: string;
  bucketUrl?: string;
  size?: string;
  contentType?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DriveFolder = {
  name: string;
  parent: string;
  fullPath: string;
  bucketName?: string;
  bucketUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

interface CommonDrive {
  id: string;
  createdAt: Date;
  name: string;
}

interface FirebasePublicKeys {
  authDomain: string;
  storageBucket: string;
  appId: string;
  projectId: string;
}

interface FirebaseDriveOwned {
  permissions: "owned";
  keys: FirebasePublicKeys & {
    apiKey: string;
  };
}

interface FirebaseDriveShared {
  permissions: "shared";
  keys: FirebasePublicKeys;
}

type FirebaseDrive = { type: "firebase" } & (FirebaseDriveOwned | FirebaseDriveShared);

interface S3PublicKeys {
  region: string;
  bucketUrl: string;
  Bucket: string;
}

interface S3DriveOwned {
  permissions: "owned";
  keys: S3PublicKeys & {
    accessKey: string;
    secretKey: string;
    endpoint?: string;
  };
}

interface S3DriveShared {
  permissions: "shared";
  keys: S3PublicKeys;
}

type S3Drive = { type: "s3" | "backblaze" | "cloudflare" } & (S3DriveOwned | S3DriveShared);

export type StorageDrive = CommonDrive & (FirebaseDrive | S3Drive);
