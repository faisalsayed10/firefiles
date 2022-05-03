import { sendEvent } from "@util/firebase";
import { Bucket, BucketFile, BucketFolder, Config, UploadingFile } from "@util/types";
import axios from "axios";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
	createUserWithEmailAndPassword,
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	User,
} from "firebase/auth";
import {
	deleteObject,
	FirebaseStorage,
	getDownloadURL,
	getStorage,
	list,
	listAll,
	ref,
	StorageReference,
	uploadBytesResumable,
} from "firebase/storage";
import { nanoid } from "nanoid";
import router from "next/router";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ContextValue, ROOT_FOLDER } from "./useBucket";
import useUser from "./useUser";

const FirebaseContext = createContext<ContextValue>(null);
export default () => useContext(FirebaseContext);

type Props = {
	data: Bucket;
	fullPath?: string;
};

export const FirebaseProvider: React.FC<Props> = ({ data, fullPath, children }) => {
	const [app, setApp] = useState<FirebaseApp>();
	const [appUser, setAppUser] = useState<User>();
	const [loading, setLoading] = useState(true);
	const { currentUser } = useUser();

	const [currentFolder, setCurrentFolder] = useState<BucketFolder>(null);
	const [folders, setFolders] = useState<BucketFolder[]>(null);
	const [files, setFiles] = useState<BucketFile[]>(null);
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
	const allFilesFetched = useRef(false);

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
		};

		setFolders((folders) => [...folders, newFolder]);
		const localFolders = localStorage.getItem(`local_folders_${data.id}`);
		const folders: BucketFolder[] = localFolders ? JSON.parse(localFolders) : [];
		localStorage.setItem(`local_folders_${data.id}`, JSON.stringify([...folders, newFolder]));
	};

	const removeFolder = async (folder: BucketFolder) => {
		if (!app) return;

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
		const storage = getStorage(app);
		const res = await listAll(ref(storage, decodeURIComponent(folder.fullPath) + "/"));
		recursiveDelete(storage, res.prefixes, res.items);
	};

	const addFile = async (filesToUpload: File[] | FileList) => {
		if (!app) return;

		for (let i = 0; i < filesToUpload.length; i++) {
			const id = nanoid();
			if (/[#\$\[\]\*/]/.test(filesToUpload[i].name)) {
				toast.error("File name cannot contain special characters (#$[]*/).");
				return;
			}

			if (files.filter((f) => f.name === filesToUpload[i].name).length > 0) {
				toast.error("File with same name already exists.");
				return;
			}

			const filePath =
				currentFolder === ROOT_FOLDER
					? filesToUpload[i].name
					: `${decodeURIComponent(currentFolder.fullPath)}/${filesToUpload[i].name}`;

			const fileRef = ref(getStorage(app), filePath);
			const uploadTask = uploadBytesResumable(fileRef, filesToUpload[i]);

			setUploadingFiles((prev) =>
				prev.concat([
					{
						id,
						name: filesToUpload[i].name,
						task: uploadTask,
						state: "running",
						progress: 0,
						error: false,
					},
				])
			);

			uploadTask.on(
				"state_changed",
				(snapshot) => {
					setUploadingFiles((prevUploadingFiles) => {
						return prevUploadingFiles.map((uploadFile) => {
							if (uploadFile.id === id)
								return {
									...uploadFile,
									state: snapshot.state,
									progress: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
								};

							return uploadFile;
						});
					});
				},
				() => {
					setUploadingFiles((prevUploadingFiles) => {
						return prevUploadingFiles.map((uploadFile) => {
							if (uploadFile.id === id) return { ...uploadFile, error: true };
							return uploadFile;
						});
					});
				},
				async () => {
					setUploadingFiles((prevUploadingFiles) =>
						prevUploadingFiles.filter((uploadFile) => uploadFile.id !== id)
					);

					const newFile: BucketFile = {
						fullPath: filePath,
						name: filesToUpload[i].name,
						size: filesToUpload[i].size.toString(),
						createdAt: new Date().toISOString(),
						parent: currentFolder.fullPath,
						contentType: filesToUpload[i].type,
						bucketName: uploadTask.snapshot.metadata.bucket,
						url: await getDownloadURL(fileRef),
					};
					setFiles((files) => [...files, newFile]);
					toast.success("File uploaded successfully.");
				}
			);
		}
		sendEvent("file_upload", { count: filesToUpload.length });
	};

	const removeFile = async (file: BucketFile) => {
		if (!app) return false;
		setFiles((files) => files.filter((f) => f.fullPath !== file.fullPath));
		deleteObject(ref(getStorage(app), file.fullPath)).catch((_) => {});
		return true;
	};

	const getFileMetadata = async (file: BucketFile, i: number) => {
		const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${
			file.bucketName
		}/o/${encodeURIComponent(file.fullPath)}`;

		const { data } = await axios.get(fileUrl, {
			headers: { Authorization: `Firebase ${await appUser.getIdToken()}` },
		});

		setFiles((files) => [
			...(files || []).slice(0, i),
			{
				...file,
				contentType: data.contentType,
				size: data.size,
				createdAt: data.timeCreated,
				updatedAt: data.updated,
				url: `${fileUrl}?alt=media&token=${data.downloadTokens}`,
			},
			...(files || []).slice(i + 1),
		]);
	};

	useEffect(() => {
		if (!appUser || !files || !allFilesFetched || !allFilesFetched.current) return;

		for (let i = 0; i < files.length; i++) {
			getFileMetadata(files[i], i);
		}
	}, [appUser, allFilesFetched.current]);

	useEffect(() => {
		if (!app) return;

		const unsubscribe = onAuthStateChanged(getAuth(app), (user) => {
			setAppUser(user);
		});

		return unsubscribe;
	}, [app]);

	useEffect(() => {
		if (!currentUser) return;
		setLoading(true);
		const has_initialized = getApps().filter((app) => app.name === data.id).length > 0;
		(async () => {
			!has_initialized
				? await initializeAppAndLogin(data, currentUser, setApp)
				: setApp(getApp(data.id));
		})();

		// setLoading(false);
	}, [currentUser]);

	// set currentFolder
	useEffect(() => {
		if (!currentUser || !app || !appUser) return;
		const storage = getStorage(app);
		setFiles(null);
		setFolders(null);

		if (fullPath === "" || !fullPath) {
			setCurrentFolder(ROOT_FOLDER);
			return;
		}

		const currFolder: BucketFolder = {
			fullPath: fullPath + "/",
			name: ref(storage, fullPath).name,
			parent: ref(storage, fullPath).parent.fullPath + "/",
			bucketName: ref(storage, fullPath).bucket,
		};

		setCurrentFolder(currFolder);
	}, [fullPath, currentUser, app, appUser]);

	// get files and folders
	useEffect(() => {
		if (!currentUser || !app || !appUser || !currentFolder) return;
		const storage = getStorage(app);
		setLoading(true);
		allFilesFetched.current = false;

		(async () => {
			try {
				if (!files) {
					const reference = ref(storage, currentFolder.fullPath);
					let results = await list(reference, { maxResults: 100 });

					for (let i = 0; i < results.items.length; i++) {
						const bucketFile = {
							fullPath: results.items[i].fullPath,
							name: results.items[i].name,
							bucketName: results.items[i].bucket,
							parent: results.items[i].parent.fullPath + "/",
						};
						setFiles((files) => (files ? [...files, bucketFile] : [bucketFile]));
					}

					while (results.nextPageToken) {
						const more = await list(reference, {
							maxResults: 100,
							pageToken: results.nextPageToken,
						});

						results = {
							nextPageToken: more.nextPageToken,
							items: [...results.items, ...more.items],
							prefixes: [...results.prefixes, ...more.prefixes],
						};

						for (let i = 0; i < more.items.length; i++) {
							const bucketFile = {
								fullPath: more.items[i].fullPath,
								name: more.items[i].name,
								bucketName: more.items[i].bucket,
								parent: more.items[i].parent.fullPath + "/",
							};
							setFiles((files) => [...files, bucketFile]);
						}
					}

					allFilesFetched.current = true;

					const localFolders = localStorage.getItem(`local_folders_${data.id}`);
					let localFoldersArray: BucketFolder[] = localFolders ? JSON.parse(localFolders) : [];
					localFoldersArray = localFoldersArray.filter(
						(folder) =>
							folder.parent === currentFolder.fullPath &&
							!results.prefixes.find((prefix) => prefix.name === folder.name)
					);

					setFolders(localFoldersArray);

					for (let i = 0; i < results.prefixes.length; i++) {
						const bucketFolder = {
							fullPath: results.prefixes[i].fullPath + "/",
							name: results.prefixes[i].name,
							bucketName: results.prefixes[i].bucket,
							parent: results.prefixes[i].parent.fullPath + "/",
						};
						setFolders((folders) => [...folders, bucketFolder]);
					}
				}
			} catch (err) {
				console.error(err);
			}

			setLoading(false);
		})();

		return () => {
			allFilesFetched.current = false;
		};
	}, [currentFolder, currentUser, app, appUser]);

	return (
		<FirebaseContext.Provider
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
		</FirebaseContext.Provider>
	);
};

const recursiveDelete = async (
	storage: FirebaseStorage,
	prefixes: StorageReference[],
	items: StorageReference[]
) => {
	for (const file of items) {
		deleteObject(ref(storage, file.fullPath));
	}

	if (!prefixes || prefixes.length < 1) return;
	else {
		for (const folder of prefixes) {
			const children = await listAll(ref(storage, folder.fullPath));
			return recursiveDelete(storage, children.prefixes, children.items);
		}
	}
};

const initializeAppAndLogin = async (data: Bucket, user: User, setApp: any) => {
	const has_logged_in = window.localStorage.getItem(`has_logged_in_${data.id}`) === "true" || false;
	const initialize = initializeApp(data.keys, data.id);
	setApp(initialize);

	if (!has_logged_in) {
		await loginTheirUser(initialize, user, data);
	}
};

const loginTheirUser = async (app: FirebaseApp, user: User, data: Bucket) => {
	const auth = getAuth(app);
	const config = app.options as Config;
	const setLoggedIn = () => window.localStorage.setItem(`has_logged_in_${data.id}`, "true");
	const email = user.email.split("@")[0] + "+firefiles@" + user.email.split("@")[1];
	let password: string;

	if (config.password) {
		password = config.password;
	} else {
		password = nanoid(Math.floor(Math.random() * (30 - 20)) + 20);
	}

	await signInWithEmailAndPassword(auth, email, password)
		.then(() => setLoggedIn())
		.catch(async (err) => {
			if (err.message.includes("auth/user-not-found")) {
				await createUserWithEmailAndPassword(auth, email, password).then(() => setLoggedIn());
			} else {
				router.push("/error?message=" + err.message);
				sendEvent("bucket_error", { type: data.type, message: err.message });
			}
		});

	if (!config.password) {
		await axios.put(
			`/api/bucket?id=${data.id}`,
			{ ...config, password },
			{ headers: { token: await user.getIdToken() } }
		);
	}
};
