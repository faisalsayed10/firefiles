import { FirebaseOptions } from "firebase/app";
import { UploadTask } from "firebase/storage";

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

export enum BucketType {
	firebase,
	s3,
	minio,
	backblaze,
	deta,
	git,
}

export type Bucket = {
	id: string;
	keys: any;
	name: string;
	type: string;
	userId: string;
};

export type BucketFile = {
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

export type BucketFolder = {
	name: string;
	parent: string;
	fullPath: string;
	bucketName?: string;
	bucketUrl?: string;
	createdAt?: string;
	updatedAt?: string;
};
