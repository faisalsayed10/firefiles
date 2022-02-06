import { FirebaseOptions } from "firebase/app";
import { UploadTask } from "firebase/storage";

export type CurrentlyUploading = {
	id: string;
	name: string;
	progress: number;
	error: boolean;
	task: UploadTask;
	state: string;
};

export type Config = FirebaseOptions & { password?: string };

export enum BucketType {
	firebase,
	s3,
	minio,
	backblaze,
	deta,
	git
}

export type Bucket = {
	id: string;
	keys: any;
	name: string;
	type: string;
	userId: string;
};
