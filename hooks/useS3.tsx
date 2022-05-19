import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Drive } from "@prisma/client";
import { cryptoHexEncodedHash256, cryptoMd5Method, signRequest } from "@util/helpers/s3-helpers";
import { DriveFile, DriveFolder, UploadingFile } from "@util/types";
import Evaporate from "evaporate";
import mime from "mime-types";
import { nanoid } from "nanoid";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ContextValue, ROOT_FOLDER } from "./useBucket";
import useUser from "./useUser";

const S3Context = createContext<ContextValue>(null);
export default () => useContext(S3Context);

type Props = {
	data: Drive & { keys: any };
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
	const { user } = useUser();

	const [currentFolder, setCurrentFolder] = useState<DriveFolder>(null);
	const [folders, setFolders] = useState<DriveFolder[]>(null);
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
	const [files, setFiles] = useState<DriveFile[]>(null);

	const addFolder = (name: string) => {
		const path =
			currentFolder.fullPath !== ""
				? decodeURIComponent(currentFolder.fullPath) + name + "/"
				: name + "/";

		const newFolder: DriveFolder = {
			name,
			fullPath: path,
			parent: currentFolder.fullPath,
			createdAt: new Date().toISOString(),
			bucketName: data.keys.Bucket,
			bucketUrl: `https://${data.keys.Bucket}.s3.${data.keys.region}.amazonaws.com`,
		};

		setFolders((folders) => [...folders, newFolder]);
		const localFolders = localStorage.getItem(`local_folders_${data.id}`);
		const folders: DriveFolder[] = localFolders ? JSON.parse(localFolders) : [];
		localStorage.setItem(`local_folders_${data.id}`, JSON.stringify([...folders, newFolder]));
	};

	const removeFolder = async (folder: DriveFolder) => {
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

	const addFile = async (filesToUpload: File[] | FileList) => {
		const evaporate = await Evaporate.create({
			bucket: data.keys.Bucket,
			awsRegion: data.keys.region,
			aws_key: data.keys.accessKey,
			computeContentMd5: true,
			cryptoMd5Method,
			cryptoHexEncodedHash256,
			customAuthMethod: (_, __, stringToSign) => signRequest(stringToSign, data.keys.secretKey),
			logging: false,
		});

		Array.from(filesToUpload).forEach(async (toUpload) => {
			const id = nanoid();
			if (/[#\$\[\]\*/]/.test(toUpload.name)) {
				toast.error("File name cannot contain special characters (#$[]*/).");
				return;
			}

			if (files?.filter((f) => f.name === toUpload.name).length > 0) {
				toast.error("File with same name already exists.");
				return;
			}

			const filePath =
				currentFolder === ROOT_FOLDER
					? toUpload.name
					: `${decodeURIComponent(currentFolder.fullPath)}${toUpload.name}`;

			evaporate.add({
				name: filePath,
				file: toUpload,
				contentType: mime.lookup(toUpload.name) || "application/octet-stream",
				uploadInitiated: () => {
					setUploadingFiles((prev) =>
						prev.concat([
							{
								id,
								name: toUpload.name,
								key: `${data.keys.Bucket}/${filePath}`,
								task: evaporate,
								state: "running",
								progress: 0,
								error: false,
							},
						])
					);
				},
				progress: (_, stats) => {
					setUploadingFiles((prevUploadingFiles) =>
						prevUploadingFiles.map((uploadFile) => {
							return uploadFile.id === id
								? {
										...uploadFile,
										state: "running",
										progress: Math.round((stats.totalUploaded / stats.fileSize) * 100),
								  }
								: uploadFile;
						})
					);
				},
				paused: () => {
					setUploadingFiles((prevUploadingFiles) =>
						prevUploadingFiles.map((uploadFile) => {
							return uploadFile.id === id ? { ...uploadFile, state: "paused" } : uploadFile;
						})
					);
				},
				resumed: () => {
					setUploadingFiles((prevUploadingFiles) =>
						prevUploadingFiles.map((uploadFile) => {
							return uploadFile.id === id ? { ...uploadFile, state: "running" } : uploadFile;
						})
					);
				},
				error: (_) => {
					setUploadingFiles((prevUploadingFiles) => {
						return prevUploadingFiles.map((uploadFile) => {
							if (uploadFile.id === id) return { ...uploadFile, error: true };
							return uploadFile;
						});
					});
				},
				complete: async (_xhr, file_key) => {
					console.log("complete", decodeURIComponent(file_key));
					setUploadingFiles((prevUploadingFiles) =>
						prevUploadingFiles.filter((uploadFile) => uploadFile.id !== id)
					);
					const newFile: DriveFile = {
						fullPath: filePath,
						name: toUpload.name,
						parent: currentFolder.fullPath,
						size: toUpload.size.toString(),
						createdAt: new Date().toISOString(),
						contentType: mime.lookup(toUpload.name) || "application/octet-stream",
						bucketName: data.keys.Bucket,
						bucketUrl: `https://${data.keys.Bucket}.s3.${data.keys.region}.amazonaws.com`,
						url: await getSignedUrl(
							s3Client,
							new GetObjectCommand({ Bucket: data.keys.Bucket, Key: decodeURIComponent(file_key) }),
							{ expiresIn: 3600 * 24 }
						),
					};
					setFiles((files) => (files ? [...files, newFile] : [newFile]));
					toast.success("File uploaded successfully.");
				},
			});
		});
	};

	const removeFile = async (file: DriveFile) => {
		setFiles((files) => files.filter((f) => f.fullPath !== file.fullPath));
		await s3Client.send(new DeleteObjectCommand({ Bucket: data.keys.Bucket, Key: file.fullPath }));
		return true;
	};

	// set currentFolder
	useEffect(() => {
		if (!user?.email) return;
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
	}, [fullPath, user]);

	// get files and folders
	useEffect(() => {
		if (!user?.email || !currentFolder) return;
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
							const driveFile: DriveFile = {
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
									{ expiresIn: 3600 * 24 }
								),
							};

							setFiles((files) => (files ? [...files, driveFile] : [driveFile]));
						});
					}

					const localFolders = localStorage.getItem(`local_folders_${data.id}`);
					let localFoldersArray: DriveFolder[] = localFolders ? JSON.parse(localFolders) : [];
					localFoldersArray = localFoldersArray.filter(
						(folder) =>
							folder.parent === currentFolder.fullPath &&
							!results.CommonPrefixes?.find((prefix) => prefix.Prefix === folder.fullPath)
					);

					setFolders(localFoldersArray);

					if (results.CommonPrefixes) {
						for (let i = 0; i < results.CommonPrefixes.length; i++) {
							const driveFolder: DriveFolder = {
								fullPath: results.CommonPrefixes[i].Prefix,
								name: results.CommonPrefixes[i].Prefix.slice(0, -1).split("/").pop(),
								bucketName: results.Name,
								parent: currentFolder.fullPath,
								bucketUrl: `https://${results.Name}.s3.${data.keys.region}.amazonaws.com`,
							};
							setFolders((folders) => [...folders, driveFolder]);
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
							const driveFile: DriveFile = {
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
									{ expiresIn: 3600 * 24 }
								),
							};
							setFiles((files) => (files ? [...files, driveFile] : [driveFile]));
						});
					}
				}
			} catch (err) {
				console.error(err);
			}

			setLoading(false);
		})();
	}, [currentFolder, user]);

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
