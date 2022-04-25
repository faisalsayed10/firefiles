import { BucketFile, BucketFolder, BucketType } from "@util/types";
import useFirebase from "./useFirebase";
import useS3 from "./useS3";

export type ContextValue = {
	// app: FirebaseApp;
	// appUser: User;
	loading: boolean;
	currentFolder: BucketFolder;
	folders: BucketFolder[];
	files: BucketFile[];
	addFolder: (name: string) => void;
	removeFolder: (folder: BucketFolder) => Promise<void>;
	addFile: (file: BucketFile) => void;
	removeFile: (file: BucketFile) => void;
};

export const ROOT_FOLDER: BucketFolder = {
	name: "",
	fullPath: "",
	parent: null,
	bucketName: null,
	bucketUrl: null,
};

export default function useBucket(type: BucketType): ContextValue {
	if (type === BucketType.firebase) {
		return useFirebase();
	} else if (type === BucketType.s3) {
		return useS3();
	}

	return null;
}
