import {
  AbortMultipartUploadCommand,
  CompletedPart,
  CompleteMultipartUploadCommand,
  CompleteMultipartUploadCommandOutput,
  CreateMultipartUploadCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { EventEmitter } from "events";
import { byteLength } from "./bytelength";
import { BodyDataTypes, Options, Progress } from "./types";

export interface RawDataPart {
  partNumber: number;
  data: BodyDataTypes;
  lastPart?: boolean;
}

type EventTypes = "progress" | "initiated" | "paused" | "resumed" | "completed" | "error";
const MIN_PART_SIZE = 1024 * 1024 * 5;

export class Upload extends EventEmitter {
  /**
   * S3 multipart upload does not allow more than 10000 parts.
   */
  private MAX_PARTS = 10000;

  // Defaults.
  private queueSize = 4;
  private partSize = MIN_PART_SIZE;

  private client: S3Client;
  private params: PutObjectCommandInput;

  // used for reporting progress.
  private totalBytes?: number;
  private bytesUploadedSoFar: number;

  // used in the upload.
  private abortController: AbortController;
  private concurrentUploaders: Promise<void>[] = [];

  uploadedParts: CompletedPart[] = [];
  uploadId?: string;
  partsUploaded?: number;
  uploadEvent?: string;

  isPaused = false;

  constructor(options: Options) {
    super();

    // set defaults from options.
    this.queueSize = options.queueSize || this.queueSize;
    this.partSize = options.partSize || this.partSize;
    this.uploadId = options.uploadId || this.uploadId;
    this.partsUploaded = options.initialPartNumber || this.partsUploaded;

    this.client = options.client;
    this.params = options.params;

    this.__validateInput();

    // set progress defaults
    this.totalBytes = byteLength(this.params.Body);
    this.bytesUploadedSoFar = 0;
    this.abortController = new AbortController();
  }

  public start = async () => await this.__doMultipartUpload();

  public pause(): void {
    this.isPaused = true;
    this.abortController.abort();

    const progress = {
      Key: this.params.Key,
      Bucket: this.params.Bucket,
      uploadId: this.uploadId,
      uploadedParts: this.uploadedParts,
      bytesUploadedSoFar: this.bytesUploadedSoFar,
      totalBytes: this.totalBytes,
    };

    this.emit("paused", progress);
    const ongoing_uploads = JSON.parse(localStorage.getItem("ongoing_uploads") || "[]")
      .filter((x) => x.uploadId !== this.uploadId)
      .concat([progress]);

    localStorage.setItem("ongoing_uploads", JSON.stringify(ongoing_uploads));
  }

  public resume(): void {
    this.isPaused = false;

    const upload = JSON.parse(localStorage.getItem("ongoing_uploads") || "[]").find(
      (x) => x.Key === this.params.Key,
    );

    this.emit("resumed", upload);
    this.partsUploaded = this.uploadedParts.length;
    this.abortController = new AbortController();
    this.__doMultipartUpload();
  }

  public async cancel(): Promise<void> {
    this.abortController.abort();
    await this.client.send(
      new AbortMultipartUploadCommand({
        Bucket: this.params.Bucket,
        Key: this.params.Key,
        UploadId: this.uploadId,
      }),
    );

    const ongoing_uploads = JSON.parse(localStorage.getItem("ongoing_uploads") || "[]").filter(
      (x) => x.Key !== this.params.Key,
    );

    localStorage.setItem("ongoing_uploads", JSON.stringify(ongoing_uploads));
  }

  public on(event: EventTypes, listener: (data: any) => void): this {
    this.uploadEvent = event;
    return super.on(event, listener);
  }

  private async __doPut() {
    try {
      this.emit("initiated");
      const res = await this.client.send(new PutObjectCommand({ ...this.params }), {
        abortSignal: this.abortController.signal,
      });
      this.emit("completed", res);
      return res;
    } catch (err) {
      if (err.message.toLowerCase().includes("aborted")) return;
      console.error(err);
      this.emit("error", err);
    }
  }

  private async __uploadPart(chunksToUpload: { Body: Blob; partNumber: number }[]) {
    for await (const part of chunksToUpload) {
      try {
        if (this.uploadedParts.length > this.MAX_PARTS) {
          throw new Error(
            `Exceeded ${this.MAX_PARTS} as part of the upload to ${this.params.Key} and ${this.params.Bucket}.`,
          );
        }

        if (this.partsUploaded >= part.partNumber) continue;
        if (this.isPaused) break;

        const partResult = await this.client.send(
          new UploadPartCommand({
            ...this.params,
            UploadId: this.uploadId,
            Body: part.Body,
            PartNumber: part.partNumber,
          }),
          { abortSignal: this.abortController.signal },
        );

        this.uploadedParts.push({
          PartNumber: part.partNumber,
          ETag: partResult.ETag,
          ...(partResult.ChecksumCRC32 && { ChecksumCRC32: partResult.ChecksumCRC32 }),
          ...(partResult.ChecksumCRC32C && { ChecksumCRC32C: partResult.ChecksumCRC32C }),
          ...(partResult.ChecksumSHA1 && { ChecksumSHA1: partResult.ChecksumSHA1 }),
          ...(partResult.ChecksumSHA256 && { ChecksumSHA256: partResult.ChecksumSHA256 }),
        });

        this.bytesUploadedSoFar += byteLength(part.Body);
        this.__notifyProgress({
          loaded: this.bytesUploadedSoFar,
          total: this.totalBytes,
          part: part.partNumber,
          Key: this.params.Key,
          Bucket: this.params.Bucket,
        });
      } catch (err) {
        if (err.message.toLowerCase().includes("aborted")) return;
        console.error(err);
        this.emit("error", err);
      }
    }
  }

  private async __doMultipartUpload(): Promise<CompleteMultipartUploadCommandOutput | void> {
    try {
      if (this.totalBytes < 5000000) {
        return this.__doPut();
      }

      if (!this.uploadId) {
        const res = await this.client.send(new CreateMultipartUploadCommand({ ...this.params }));
        this.uploadId = res.UploadId;
        this.emit("initiated", "res");
      }

      const chunksToUpload = [];
      let startByte = 0;
      let endByte = this.partSize;

      for (let i = 0; i < Math.ceil(this.totalBytes / this.partSize); i++) {
        const chunk = (this.params.Body as File).slice(startByte, endByte);
        chunksToUpload.push({ Body: chunk, partNumber: i + 1 });

        startByte = endByte;
        endByte = startByte + this.partSize;
      }

      await this.__uploadPart(chunksToUpload);
      if (this.isPaused) return;

      const res = await this.client.send(
        new CompleteMultipartUploadCommand({
          ...this.params,
          UploadId: this.uploadId,
          MultipartUpload: {
            Parts: this.uploadedParts.sort((a, b) => a.PartNumber! - b.PartNumber!),
          },
        }),
      );

      this.emit("completed", res);
      const ongoing_uploads = JSON.parse(localStorage.getItem("ongoing_uploads") || "[]").filter(
        (x) => x.Key !== this.params.Key,
      );

      localStorage.setItem("ongoing_uploads", JSON.stringify(ongoing_uploads));
      return res;
    } catch (err) {
      if (err.message.toLowerCase().includes("aborted")) return;
      console.error(err);
      this.emit("error", err);
    }
  }

  private __notifyProgress(progress: Progress): void {
    if (this.uploadEvent) {
      this.emit("progress", progress);
    }
  }

  private __validateInput(): void {
    if (!this.params) {
      throw new Error(`InputError: Upload requires params to be passed to upload.`);
    }

    if (!this.client) {
      throw new Error(`InputError: Upload requires a AWS client to do uploads with.`);
    }

    if (this.partSize < MIN_PART_SIZE) {
      throw new Error(
        `EntityTooSmall: Your proposed upload partsize [${this.partSize}] is smaller than the minimum allowed size [${MIN_PART_SIZE}] (5MB)`,
      );
    }

    if (this.queueSize < 1) {
      throw new Error(`Queue size: Must have at least one uploading queue.`);
    }
  }
}
