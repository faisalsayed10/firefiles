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
