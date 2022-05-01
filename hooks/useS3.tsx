import {
	DeleteObjectCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Bucket, BucketFile, BucketFolder, UploadingFile } from "@util/types";
import mime from "mime-types";
import { createContext, useContext, useEffect, useState } from "react";
import { ContextValue, ROOT_FOLDER } from "./useBucket";
import useUser from "./useUser";

const S3Context = createContext<ContextValue>(null);
export default () => useContext(S3Context);

type Props = {
	data: Bucket;
	fullPath?: string;
};

export const S3Provider: React.FC<Props> = ({ data, fullPath, children }) => {
	const [loading, setLoading] = useState(false);
	const { currentUser } = useUser();

	const [currentFolder, setCurrentFolder] = useState<BucketFolder>(null);
	const [folders, setFolders] = useState<BucketFolder[]>(null);
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
	const [files, setFiles] = useState<BucketFile[]>(null);

	const addFolder = (name: string) => {
		const path =
			currentFolder.fullPath !== ""
				? decodeURIComponent(currentFolder.fullPath) + name + "/"
				: name + "/";

		const newFolder: BucketFolder = {
			name,
			fullPath: path,
			parent: currentFolder.fullPath,
			createdAt: new Date().toISOString(),
			bucketName: data.keys.Bucket,
			bucketUrl: `https://${data.keys.Bucket}.s3.${data.keys.region}.amazonaws.com`,
		};

		setFolders((folders) => [...folders, newFolder]);
		const localFolders = localStorage.getItem(`local_folders_${data.id}`);
		const folders: BucketFolder[] = localFolders ? JSON.parse(localFolders) : [];
		localStorage.setItem(`local_folders_${data.id}`, JSON.stringify([...folders, newFolder]));
	};

	const removeFolder = async (folder: BucketFolder) => {
		setFolders((folders) => folders.filter((f) => f.fullPath !== folder.fullPath));
	};

	const addFile = async (files: File[] | FileList) => {
		// setFiles((files) => [...files, file]);
	};

	const removeFile = async (file: BucketFile) => {
		const s3Client = new S3Client({
			region: data.keys.region,
			maxAttempts: 1,
			credentials: { accessKeyId: data.keys.accessKey, secretAccessKey: data.keys.secretKey },
		});

		setFiles((files) => files.filter((f) => f.fullPath !== file.fullPath));
		await s3Client.send(new DeleteObjectCommand({ Bucket: data.keys.Bucket, Key: file.fullPath }));
		return true;
	};

	useEffect(() => {
		if (!currentUser) return;
		setFiles(null);
		setFolders(null);

		if (fullPath === "" || !fullPath) {
			setCurrentFolder(ROOT_FOLDER);
			return;
		}

		setCurrentFolder({
			fullPath: fullPath + "/",
			name: fullPath.split("/").pop(),
			bucketName: data.keys.Bucket,
			parent: fullPath.split("/").shift() + "/",
			bucketUrl: `https://${data.keys.Bucket}.s3.${data.keys.region}.amazonaws.com`,
		});
	}, [fullPath, currentUser]);

	// get files and folders
	useEffect(() => {
		if (!currentUser || !currentFolder) return;
		setLoading(true);

		(async () => {
			try {
				if (!files) {
					const s3Client = new S3Client({
						region: data.keys.region,
						maxAttempts: 1,
						credentials: { accessKeyId: data.keys.accessKey, secretAccessKey: data.keys.secretKey },
					});

					let results = await s3Client.send(
						new ListObjectsV2Command({
							Bucket: data.keys.Bucket,
							Prefix: currentFolder.fullPath,
							Delimiter: "/",
						})
					);

					if (results.Contents) {
						results.Contents.forEach(async (result) => {
							const bucketFile: BucketFile = {
								fullPath: result.Key,
								name: result.Key.split("/").pop(),
								parent: currentFolder.fullPath,
								createdAt: result.LastModified.toISOString(),
								size: result.Size.toString(),
								contentType: mime.lookup(result.Key) || "",
								bucketName: results.Name,
								bucketUrl: `https://${results.Name}.s3.${data.keys.region}.amazonaws.com`,
								url: await getSignedUrl(
									s3Client,
									new GetObjectCommand({ Bucket: results.Name, Key: result.Key }),
									{ expiresIn: 3600 }
								),
							};

							setFiles((files) => (files ? [...files, bucketFile] : [bucketFile]));
						});
					}

					const localFolders = localStorage.getItem(`local_folders_${data.id}`);
					let localFoldersArray: BucketFolder[] = localFolders ? JSON.parse(localFolders) : [];
					localFoldersArray = localFoldersArray.filter(
						(folder) =>
							folder.parent === currentFolder.fullPath &&
							!results.CommonPrefixes.find((prefix) => prefix.Prefix === folder.fullPath)
					);

					setFolders(localFoldersArray);

					if (results.CommonPrefixes) {
						for (let i = 0; i < results.CommonPrefixes.length; i++) {
							const bucketFolder: BucketFolder = {
								fullPath: results.CommonPrefixes[i].Prefix,
								name: results.CommonPrefixes[i].Prefix.slice(0, -1).split("/").pop(),
								bucketName: results.Name,
								parent: currentFolder.fullPath,
								bucketUrl: `https://${results.Name}.s3.${data.keys.region}.amazonaws.com`,
							};
							setFolders((folders) => [...folders, bucketFolder]);
						}
					}

					// loop to list all files.
					while (results.IsTruncated) {
						results = await s3Client.send(
							new ListObjectsV2Command({
								Bucket: data.keys.Bucket,
								Prefix: currentFolder.fullPath,
								ContinuationToken: results.ContinuationToken,
								Delimiter: "/",
							})
						);

						results.Contents.forEach(async (result) => {
							const bucketFile: BucketFile = {
								fullPath: result.Key,
								name: result.Key.split("/").pop(),
								parent: currentFolder.fullPath,
								createdAt: result.LastModified.toISOString(),
								size: result.Size.toString(),
								contentType: mime.lookup(result.Key) || "",
								bucketName: results.Name,
								bucketUrl: `https://${results.Name}.s3.${data.keys.region}.amazonaws.com`,
								url: await getSignedUrl(
									s3Client,
									new GetObjectCommand({ Bucket: results.Name, Key: result.Key }),
									{ expiresIn: 3600 }
								),
							};
							setFiles((files) => (files ? [...files, bucketFile] : [bucketFile]));
						});
					}
				}
			} catch (err) {
				console.error(err);
			}

			setLoading(false);
		})();
	}, [currentFolder, currentUser]);

	return (
		<S3Context.Provider
			value={{
				loading,
				currentFolder,
				files,
				folders,
				uploadingFiles,
				setUploadingFiles,
				addFile,
				addFolder,
				removeFile,
				removeFolder,
			}}
		>
			{children}
		</S3Context.Provider>
	);
};
