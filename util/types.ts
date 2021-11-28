export type CurrentlyUploading = { id: string; name: string; progress: number; error: boolean };

export type FolderCollection = {
  id?: string;
	name: string;
	parentId?: string;
	path?: { name: string; id: string }[];
	createdAt?: string;
};

export type FileCollection = {
	id?: string;
	name: string;
  size: number;
  filePath: string;
  folderId: string;
	createdAt?: string;
	url: string;
};
