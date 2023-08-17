import { DriveFile, DriveFolder, Provider, Tag, UploadingFile } from "@util/types";
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
  syncFilesInCurrentFolder: () => Promise<() => void>;
	enableTags: boolean;
	listTags?: (file: DriveFile) => Promise<void | Tag[] >;
	addTags?: (file: DriveFile, key: string, value: string) => Promise<boolean>;
	editTags?: (file: DriveFile, prevTag: Tag, newTag: Tag) => Promise<boolean>;
	removeTags?: (file: DriveFile, key: string) => Promise<boolean>;
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

  if ((Provider[keys.type] as Provider) === Provider.firebase) {
    return useFirebase();
  } else if ((Provider[keys.type] as Provider) === Provider.s3) {
    return useS3();
  } else if ((Provider[keys.type] as Provider) === Provider.backblaze) {
    return useS3();
  } else if ((Provider[keys.type] as Provider) === Provider.cloudflare) {
    return useS3();
  }

	return null;
}
