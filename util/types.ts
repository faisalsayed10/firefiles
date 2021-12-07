export type CurrentlyUploading = { id: string; name: string; progress: number; error: boolean };

export type FileCollection = {
	id?: string;
	name: string;
	size: number;
	url: string;
	parentPath: string;
	createdAt?: string;
};
