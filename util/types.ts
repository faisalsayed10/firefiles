import { FirebaseOptions } from "firebase/app";

export type CurrentlyUploading = { id: string; name: string; progress: number; error: boolean };
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
