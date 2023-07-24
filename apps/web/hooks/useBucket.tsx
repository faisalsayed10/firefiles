import { DriveFile, DriveFolder, Provider, UploadingFile } from "@util/types";
import useFirebase from "./useFirebase";
import useKeys from "./useKeys";
import useS3 from "./useS3";

export type ContextValue = {
	loading: boolean;
	currentFolder: DriveFolder;
	folders: DriveFolder[];
	files: DriveFile[];
	uploadingFiles: UploadingFile[];
	setUploadingFiles: React.Dispatch<React.SetStateAction<UploadingFile[]>>;
	addFolder: (name: string) => void;
	removeFolder: (folder: DriveFolder) => Promise<void>;
	addFile: (files: File[] | FileList) => Promise<any>;
	removeFile: (file: DriveFile) => Promise<boolean>;
};

export const ROOT_FOLDER: DriveFolder = {
	name: "",
	fullPath: "",
	parent: null,
	bucketName: null,
	bucketUrl: null,
};

export default function useBucket(): ContextValue {
	const { keys } = useKeys();
  
	switch (Provider[keys.type] as Provider) {
	  case Provider.firebase:
		return useFirebase();
	  case Provider.s3:
	  case Provider.backblaze:
	  case Provider.wasabi:
	  case Provider.digitalocean:
		return useS3();
	  default:
		return null;
	}
  }

