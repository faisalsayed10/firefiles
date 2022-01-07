import { FirebaseOptions } from "firebase/app";

export type CurrentlyUploading = { id: string; name: string; progress: number; error: boolean };
export type Config = FirebaseOptions & { password?: string };
