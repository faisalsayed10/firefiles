import { BucketFile, BucketFolder, BucketType, UploadingFile } from "@util/types";
import useFirebase from "./useFirebase";
import useS3 from "./useS3";

export type ContextValue = {
	loading: boolean;
	currentFolder: BucketFolder;
	folders: BucketFolder[];
	files: BucketFile[];
	uploadingFiles: UploadingFile[];
	setUploadingFiles: React.Dispatch<React.SetStateAction<UploadingFile[]>>;
	addFolder: (name: string) => void;
	removeFolder: (folder: BucketFolder) => Promise<void>;
	addFile: (files: File[] | FileList) => Promise<void>;
	removeFile: (file: BucketFile) => Promise<boolean>;
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
