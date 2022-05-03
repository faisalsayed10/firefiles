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
	const [s3Client, setS3Client] = useState<S3Client>(
		new S3Client({
			region: data.keys.region,
			maxAttempts: 1,
			credentials: { accessKeyId: data.keys.accessKey, secretAccessKey: data.keys.secretKey },
		})
	);
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
		// remove from local state
		setFolders((folders) => folders.filter((f) => f.fullPath !== folder.fullPath));

		// delete from localStorage
		const localFolders = localStorage.getItem(`local_folders_${data.id}`);
		if (localFolders) {
			const folders = JSON.parse(localFolders);
			const filtered = folders.filter((f) => !f.fullPath.includes(folder.fullPath));
			localStorage.setItem(`local_folders_${data.id}`, JSON.stringify(filtered));
		}

		// recursively delete children
		await emptyS3Directory(s3Client, folder.bucketName, folder.fullPath);
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

	// set currentFolder
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
							!results.CommonPrefixes?.find((prefix) => prefix.Prefix === folder.fullPath)
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

async function emptyS3Directory(client: S3Client, Bucket: string, Prefix: string) {
	const listParams = { Bucket, Prefix };
	const listedObjects = await client.send(new ListObjectsV2Command(listParams));

	if (listedObjects.CommonPrefixes?.length > 0) {
		for (let i = 0; i < listedObjects.CommonPrefixes.length; i++) {
			await emptyS3Directory(client, Bucket, listedObjects.CommonPrefixes[i].Prefix);
		}
	}

	if (listedObjects.Contents?.length === 0) return;

	const deleteParams = { Bucket, Delete: { Objects: [] } };

	for (let i = 0; i < listedObjects.Contents.length; i++) {
		deleteParams.Delete.Objects.push({ Key: listedObjects.Contents[i].Key });
	}

	await client.send(new DeleteObjectsCommand(deleteParams));
	if (listedObjects.IsTruncated) await emptyS3Directory(client, Bucket, Prefix);
}
