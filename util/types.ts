export type CurrentlyUploading = { id: string; name: string; progress: number; error: boolean };

export type UserData = {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	appId: string;
};
