import { sendEvent } from "@util/firebase";
import { Bucket, Config } from "@util/types";
import axios from "axios";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
	createUserWithEmailAndPassword,
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	User,
} from "firebase/auth";
import { getStorage, list, ref, StorageReference } from "firebase/storage";
import { nanoid } from "nanoid";
import router from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import useUser from "./useUser";

type ContextValue = {
	app: FirebaseApp;
	appUser: User;
	loading: boolean;
	currentFolder: StorageReference;
	folders: StorageReference[];
	files: StorageReference[];
	addFolder: (folder: StorageReference) => void;
	removeFolder: (folder: StorageReference) => void;
	addFile: (file: StorageReference) => void;
	removeFile: (file: StorageReference) => void;
};

const FirebaseContext = createContext<ContextValue>(null);

export const ROOT_FOLDER: StorageReference = {
	name: "",
	fullPath: "",
	parent: null,
	root: null,
	bucket: null,
	storage: null,
};

export default () => useContext(FirebaseContext);

type Props = {
	data: Bucket;
	fullPath?: string;
};

export const FirebaseProvider: React.FC<Props> = ({ data, fullPath, children }) => {
	const [app, setApp] = useState<FirebaseApp>();
	const [appUser, setAppUser] = useState<User>();
	const [loading, setLoading] = useState(false);
	const { currentUser } = useUser();

	const [currentFolder, setCurrentFolder] = useState<StorageReference>(null);
	const [folders, setFolders] = useState<StorageReference[]>(null);
	const [files, setFiles] = useState<StorageReference[]>(null);

	const addFolder = (folder: StorageReference) => {
		setFolders((folders) => [...folders, folder]);
	};

	const removeFolder = (folder: StorageReference) => {
		setFolders((folders) => folders.filter((f) => f.fullPath !== folder.fullPath));
	};

	const addFile = (file: StorageReference) => {
		setFiles((files) => [...files, file]);
	};

	const removeFile = (file: StorageReference) => {
		setFiles((files) => files.filter((f) => f.fullPath !== file.fullPath));
	};

	useEffect(() => {
		if (!app) return;

		const unsubscribe = onAuthStateChanged(getAuth(app), (user) => {
			setAppUser(user);
		});

		return unsubscribe;
	}, [app]);

	const initializeAppAndLogin = async () => {
		const has_logged_in =
			window.localStorage.getItem(`has_logged_in_${data.id}`) === "true" || false;
		const initialize = initializeApp(data.keys, data.id);
		setApp(initialize);

		if (!has_logged_in) {
			await loginTheirUser(initialize);
		}
	};

	const loginTheirUser = async (app: FirebaseApp) => {
		const auth = getAuth(app);
		const config = app.options as Config;
		const setLoggedIn = () => window.localStorage.setItem(`has_logged_in_${data.id}`, "true");
		const email = currentUser.email.split("@")[0] + "+firefiles@" + currentUser.email.split("@")[1];
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
				{ headers: { token: await currentUser.getIdToken() } }
			);
		}
	};

	useEffect(() => {
		if (!currentUser) return;
		setLoading(true);
		const has_initialized = getApps().filter((app) => app.name === data.id).length > 0;
		(async () => {
			!has_initialized ? await initializeAppAndLogin() : setApp(getApp(data.id));
		})();

		setLoading(false);
	}, [currentUser]);

	useEffect(() => {
		if (!currentUser || !app || !appUser) return;
		const storage = getStorage(app);

		if (fullPath === "" || !fullPath) {
			setCurrentFolder(ROOT_FOLDER);
			return;
		}

		setCurrentFolder(ref(storage, fullPath));
	}, [fullPath, currentUser, app, appUser]);

	// get files and folders
	useEffect(() => {
		if (!currentUser || !app || !appUser) return;
		const storage = getStorage(app);
		setLoading(true);

		(async () => {
			try {
				const reference = ref(storage, fullPath);
				let results = await list(reference, { maxResults: 100 });

				setFiles(results.items);

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

					setFiles(results.items);
				}

				const localFolders = localStorage.getItem(`local_folders_${data.id}`);
				const localFoldersArray: StorageReference[] = localFolders ? JSON.parse(localFolders) : [];
				results.prefixes.push(
					...localFoldersArray.filter((folder) => {
						const parentPath = folder.fullPath.split("/").slice(0, -1).join("/");
						return (
							parentPath === fullPath &&
							!results.prefixes.find((prefix) => prefix.name === folder.name)
						);
					})
				);

				setFolders(results.prefixes.sort());
			} catch (err) {
				console.error(err);
			}

			setLoading(false);
		})();
	}, [fullPath, currentUser, app, appUser]);

	return (
		<FirebaseContext.Provider
			value={{
				app,
				appUser,
				loading,
				currentFolder,
				files,
				folders,
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
