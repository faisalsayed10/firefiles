import { PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";

export interface Progress {
  loaded?: number;
  total?: number;
  part?: number;
  Key?: string;
  Bucket?: string;
}

// string | Uint8Array | Buffer | Readable | ReadableStream | Blob.
export type BodyDataTypes = PutObjectCommandInput["Body"];

export interface Configuration {
  queueSize: number;
  partSize: number;
  uploadId?: string;
  initialPartNumber?: number;
}

export interface Options extends Partial<Configuration> {
  params: PutObjectCommandInput;
  client: S3Client;
}
