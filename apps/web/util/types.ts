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
  wasabi,
  digitalocean,
  cloudflare,
  scaleway,
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

export type Tag = {
  key: string;
  value: string;
};

interface CommonDrive {
  id: string;
  createdAt: Date;
  name: string;
  permissions: "owned" | "shared";
  environment: "client" | "server";
  supportsDeletion: boolean;
  supportsGetObject: boolean;
  supportsListObjects: boolean;
}

interface FirebasePublicKeys {
  authDomain: string;
  storageBucket: string;
  appId: string;
  projectId: string;
  password?: string;
}

interface FirebaseDriveOwned {
  permissions: "owned";
  supportsDeletion: true;
  supportsGetObject: true;
  supportsListObjects: true;
  keys: FirebasePublicKeys & {
    apiKey: string;
  };
}

interface FirebaseDriveShared {
  supportsDeletion: false;
  supportsGetObject: false;
  supportsListObjects: false;
  permissions: "shared";
  keys: FirebasePublicKeys;
}

interface FirebaseDriveClient {
  environment: "client";
}

interface FirebaseDriveServer {
  environment: "server";
  getDeleteObjectUrl?: () => Promise<string>;
  getListObjectsUrl?: () => Promise<string>;
  getObjectUrl?: () => Promise<string>;
  performDeleteObjects?: () => void;
}

type FirebaseDrive = { type: "firebase" } & (FirebaseDriveOwned | FirebaseDriveShared) &
  (FirebaseDriveClient | FirebaseDriveServer);

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
  supportsTagging: true;
  supportsUploading: true;
}

interface S3DriveShared {
  permissions: "shared";
  keys: S3PublicKeys;
  supportsTagging: false;
  supportsUploading: false;
}

interface S3DriveClient {
  environment: "client";
}

interface S3DriveServer {
  environment: "server";
  getDeleteObjectUrl: (fullPath: string) => Promise<string>;
  getListObjectsUrl: (
    fullPath: string,
    continuationToken?: string,
    delimiter?: string,
  ) => Promise<string>;
  getObjectUrl: (fullPath: string) => Promise<string>;
  performDeleteObjects: (deleteParams: string) => void;
}

type S3Drive = {
  type: "s3" | "backblaze" | "cloudflare" | "wasabi" | "digitalocean" | "scaleway";
  supportsDeletion: true;
  supportsGetObject: true;
  supportsListObjects: true;
} & (S3DriveOwned | S3DriveShared) &
  (S3DriveClient | S3DriveServer);

export type StorageDrive = CommonDrive & (FirebaseDrive | S3Drive);
export type TagFilter = {
  key?: string;
  value?: string;
};
