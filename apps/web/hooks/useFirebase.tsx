import { Drive, User } from "@prisma/client";
import { Config, DriveFile, DriveFolder, Tag, UploadingFile } from "@util/types";
import axios from "axios";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User as FirebaseUser,
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
import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ContextValue, ROOT_FOLDER } from "./useBucket";
import useUser from "./useUser";
import useIndexedDB from "./useIndexedDB";
import { getMetadata, updateMetadata } from "@firebase/storage";

const FirebaseContext = createContext<ContextValue>(null);
export default () => useContext(FirebaseContext);

type Props = {
  data: Drive;
  fullPath?: string;
};

export const FirebaseProvider: React.FC<PropsWithChildren<Props>> = ({
  data,
  fullPath,
  children,
}) => {
  
  const [app, setApp] = useState<FirebaseApp>();
  const [appUser, setAppUser] = useState<FirebaseUser>();
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const [currentFolder, setCurrentFolder] = useState<DriveFolder>(null);
  const [folders, setFolders] = useState<DriveFolder[]>(null);
  const [files, setFiles] = useState<DriveFile[]>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const allFilesFetched = useRef(false);
  const enableTags = true;
  const driveName = data.name;

  const {
    db,
    createNewDrive,
    addFileToDrive,
    deleteFileFromDrive,
    deleteFilesInFolder,
    getFileByFullPath,
    isFileInDrive,
    isCurrentFolderInDB,
    getFilesInCurrentFolder,
    addFolderToDrive,
    getFoldersInCurrentFolder,
    syncWithFirebaseResponse,
  } = useIndexedDB();

  const addFolder = (name: string) => {
    const path =
      currentFolder.fullPath !== ""
        ? decodeURIComponent(currentFolder.fullPath) + name + "/"
        : name + "/";

    if (currentFolder.fullPath === "") currentFolder.fullPath = "/";
    const newFolder: DriveFolder = {
      name,
      fullPath: path,
      parent: currentFolder.fullPath,
      createdAt: new Date().toISOString(),
    };

    setFolders((folders) => [...(folders || []), newFolder]);
    addFolderToDrive(driveName, newFolder);
    const localFolders = localStorage.getItem(`local_folders_${data.id}`);
    const folders: DriveFolder[] = localFolders ? JSON.parse(localFolders) : [];
    localStorage.setItem(`local_folders_${data.id}`, JSON.stringify([...folders, newFolder]));
  };

  const removeFolder = async (folder: DriveFolder) => {
    if (!app) return;

    // remove from local state
    setFolders((folders) => folders.filter((f) => f.fullPath !== folder.fullPath));

    deleteFilesInFolder(driveName, folder.fullPath);

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

      if (files?.filter((f) => f.name === filesToUpload[i].name).length > 0) {
        toast.error("File with same name already exists.");
        return;
      }

      const filePath =
        currentFolder === ROOT_FOLDER
          ? filesToUpload[i].name
          : `${decodeURIComponent(currentFolder.fullPath)}${filesToUpload[i].name}`;

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
        ]),
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
            prevUploadingFiles.filter((uploadFile) => uploadFile.id !== id),
          );

          const newFile: DriveFile = {
            fullPath: filePath,
            name: filesToUpload[i].name,
            size: filesToUpload[i].size.toString(),
            createdAt: new Date().toISOString(),
            parent: currentFolder.fullPath,
            contentType: filesToUpload[i].type,
            bucketName: uploadTask.snapshot.metadata.bucket,
            url: await getDownloadURL(fileRef),
          };
          setFiles((files) => [...(files || []), newFile]);
          addFileToDrive(data.name, newFile);
          toast.success("File uploaded successfully.");
        },
      );
    }
  };

  const removeFile = async (file: DriveFile) => {
    if (!app) return false;
    setFiles((files) => files.filter((f) => f.fullPath !== file.fullPath));
    deleteFileFromDrive(data.name, file.fullPath);
    deleteObject(ref(getStorage(app), file.fullPath)).catch((_) => {});
    return true;
  };
    
	// get array of tags
	const listTags = async (file: DriveFile): Promise<Tag[] | void> => {
		if (!app) return;
		return getMetadata(ref(getStorage(app), file.fullPath))
			.then((metadata) => {
				// convert customMetadata object to array of objects in the format: {key: tagKey, value: tagValue}
				if (metadata.customMetadata) {
					return Object.entries(metadata.customMetadata).map(([k, v]) => ({ key: k, value: v }));
				}
			}).catch((err) => {
					toast.error(`${err.message}`);
			});
	}

	// add tag to object
	const addTags = async (file: DriveFile, key: string, value: string): Promise<boolean> => {
		if (!app) return false;
		if (!key.trim()){
			toast.error('Error: Tag key is blank.')
			return false;
		}
		key = key.trim()
		const tagList = await listTags(file);
		// check for existing tag key, since same tag key will overwrite the previous value
		if (tagList) {
			for (const tag of tagList) {
				if (tag.key === key) {
					toast.error('Error: Tag key already exists.')
					return false;
				}
			}
		}
		await updateMetadata(ref(getStorage(app), file.fullPath),  {
			customMetadata: {
				[key]:value,
			} }).catch((err) => {
				toast.error(`${err.message}`);
				return false;
			});
		return true;
	}

	// edit existing tag
	const editTags = async (file: DriveFile, prevTag: Tag, newTag: Tag): Promise<boolean> => {
		if (!app) return false;
		// remove previous tag in order to edit
		if (!await removeTags(file, prevTag.key)) {
				return false;
		}
		// update the tag
		if (await addTags(file, newTag.key, newTag.value)){
			return true;
		} else {
			// if new tag values are invalid, add back the previous tag
			await addTags(file, prevTag.key, prevTag.value)
			toast.error(`Error: Tag not edited.`);
			return false;
		}
	}

	// remove tag from object
	const removeTags = async (file: DriveFile, key:string): Promise<boolean> => {
		if (!app) return false;
		await updateMetadata(ref(getStorage(app), file.fullPath),  {
			customMetadata: {
				[key]:null,
			} }).catch((err) => {
				toast.error(`${err.message}`);
				return false;
			});
		return true;
	}

  const getFileMetadata = async (file: DriveFile, i: number) => {
    let updatedFile: DriveFile;

    // Check if the file is already in the drive
    const foundFile = await getFileByFullPath(driveName, file.fullPath);

    if (!foundFile) {
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${
        file.bucketName
      }/o/${encodeURIComponent(file.fullPath)}`;

      const { data } = await axios.get(fileUrl, {
        headers: { Authorization: `Firebase ${await appUser.getIdToken()}` },
      });

      updatedFile = {
        ...file,
        contentType: data.contentType,
        size: data.size,
        createdAt: data.timeCreated,
        updatedAt: data.updated,
        url: `${fileUrl}?alt=media&token=${data.downloadTokens}`,
        parent: currentFolder.fullPath,
      };
    } else {
      updatedFile = {
        ...file,
        size: foundFile.size,
        url: foundFile.url,
        contentType: foundFile.contentType,
        parent: foundFile.parent,
      };
    }

    setFiles((files) => [...(files || []).slice(0, i), updatedFile, ...(files || []).slice(i + 1)]);

    return updatedFile;
  };

  const syncFilesInCurrentFolder = async () => {
    if (!user?.email || !app || !appUser || !currentFolder) return;
    const storage = getStorage(app);
    setLoading(true);
    setFiles(null);
    setFolders(null);
    allFilesFetched.current = false;

    (async () => {
      try {
        const reference = ref(storage, currentFolder.fullPath);
        let results = await list(reference, { maxResults: 100 });
        await syncWithFirebaseResponse(driveName, currentFolder.fullPath, results);

        for (let i = 0; i < results.items.length; i++) {
          // const fileExists = await isFileInDrive(driveName, results.items[i].fullPath);
          // if (!fileExists) {
          const driveFile = {
            fullPath: results.items[i].fullPath,
            name: results.items[i].name,
            bucketName: results.items[i].bucket,
            parent: results.items[i].parent.fullPath + "/",
          };
          setFiles((files) => (files ? [...files, driveFile] : [driveFile]));
          // }
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
            // const fileExists = await isFileInDrive(driveName, more.items[i].fullPath);
            // if (!fileExists) {
            const driveFile = {
              fullPath: more.items[i].fullPath,
              name: more.items[i].name,
              bucketName: more.items[i].bucket,
              parent: more.items[i].parent.fullPath + "/",
            };
            setFiles((files) => [...files, driveFile]);
            // }
          }
          await syncWithFirebaseResponse(driveName, currentFolder.fullPath, results);
        }

        allFilesFetched.current = true;

        const localFolders = localStorage.getItem(`local_folders_${data.id}`);
        let localFoldersArray: DriveFolder[] = localFolders ? JSON.parse(localFolders) : [];
        localFoldersArray = localFoldersArray.filter(
          (folder) =>
            folder.parent === currentFolder.fullPath &&
            !results.prefixes.find((prefix) => prefix.name === folder.name),
        );

        setFolders(localFoldersArray);

        for (let i = 0; i < results.prefixes.length; i++) {
          const driveFolder = {
            fullPath: results.prefixes[i].fullPath + "/",
            name: results.prefixes[i].name,
            bucketName: results.prefixes[i].bucket,
            parent: results.prefixes[i].parent.fullPath + "/",
          };
          setFolders((folders) => [...(folders || []), driveFolder]);
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    })();
    return () => {
      allFilesFetched.current = false;
    };
  };

  useEffect(() => {
    const processFiles = async () => {
      if (!appUser || !files || !allFilesFetched || !allFilesFetched.current) return;

      if (!db || !db.drives.driveName) {
        await createNewDrive(driveName);
      }

      for (let i = 0; i < files.length; i++) {
        const updatedFile = await getFileMetadata(files[i], i);
        await addFileToDrive(driveName, updatedFile);
      }
    };
    processFiles();
  }, [appUser, allFilesFetched.current]);

  useEffect(() => {
    if (!app) return;

    const unsubscribe = onAuthStateChanged(getAuth(app), (user) => {
      setAppUser(user);
    });

    return unsubscribe;
  }, [app]);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    const has_initialized = getApps().filter((app) => app.name === data.id).length > 0;
    (async () => {
      !has_initialized ? await initializeAppAndLogin(data, user, setApp) : setApp(getApp(data.id));
    })();
    // setLoading(false);
  }, [user]);

  // set currentFolder
  useEffect(() => {
    if (!user?.email || !app || !appUser) return;
    const storage = getStorage(app);
    setFiles(null);
    setFolders(null);

    if (fullPath === "" || !fullPath) {
      setCurrentFolder(ROOT_FOLDER);
      return;
    }

    const currFolder: DriveFolder = {
      fullPath: fullPath + "/",
      name: ref(storage, fullPath).name,
      parent: ref(storage, fullPath).parent.fullPath + "/",
      bucketName: ref(storage, fullPath).bucket,
    };

    setCurrentFolder(currFolder);
  }, [fullPath, user, app, appUser]);

  // get files and folders
  useEffect(() => {
    if (!user?.email || !app || !appUser || !currentFolder) return;
    const storage = getStorage(app);
    setLoading(true);
    allFilesFetched.current = false;

    (async () => {
      try {
        if (!db || !db.drives.driveName) {
          await createNewDrive(driveName);
        }
        const folderInDrive = await isCurrentFolderInDB(driveName, currentFolder.fullPath);
        if (!files && !folderInDrive) {
          const reference = ref(storage, currentFolder.fullPath);
          let results = await list(reference, { maxResults: 100 });

          for (let i = 0; i < results.items.length; i++) {
            const driveFile = {
              fullPath: results.items[i].fullPath,
              name: results.items[i].name,
              bucketName: results.items[i].bucket,
              parent: results.items[i].parent.fullPath + "/",
            };
            setFiles((files) => (files ? [...files, driveFile] : [driveFile]));
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
              const driveFile = {
                fullPath: more.items[i].fullPath,
                name: more.items[i].name,
                bucketName: more.items[i].bucket,
                parent: more.items[i].parent.fullPath + "/",
              };
              setFiles((files) => [...files, driveFile]);
            }
          }

          allFilesFetched.current = true;

          const localFolders = localStorage.getItem(`local_folders_${data.id}`);
          let localFoldersArray: DriveFolder[] = localFolders ? JSON.parse(localFolders) : [];
          localFoldersArray = localFoldersArray.filter(
            (folder) =>
              folder.parent === currentFolder.fullPath &&
              !results.prefixes.find((prefix) => prefix.name === folder.name),
          );

          setFolders(localFoldersArray);

          for (let i = 0; i < localFoldersArray.length; i++) {
            await addFolderToDrive(driveName, localFoldersArray[i]);
          }

          for (let i = 0; i < results.prefixes.length; i++) {
            const driveFolder = {
              fullPath: results.prefixes[i].fullPath + "/",
              name: results.prefixes[i].name,
              bucketName: results.prefixes[i].bucket,
              parent: results.prefixes[i].parent.fullPath + "/",
            };

            setFolders((folders) => [...folders, driveFolder]);
            await addFolderToDrive(driveName, driveFolder);
          }
        } else if (folderInDrive) {
          const currentFiles = await getFilesInCurrentFolder(driveName, currentFolder.fullPath);
          for (let i = 0; i < currentFiles.length; i++) {
            await getFileMetadata(currentFiles[i], i);
          }
          allFilesFetched.current = true;

          const currentFolders = await getFoldersInCurrentFolder(driveName, currentFolder.fullPath);
          for (let i = 0; i < currentFolders.length; i++) {
            const driveFolder = {
              name: currentFolders[i].name,
              fullPath: currentFolders[i].fullPath,
              bucketName: currentFolders[i].bucketName,
              parent: currentFolders[i].parent,
            };
            setFolders((folders) => [...(folders || []), driveFolder]);
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
  }, [currentFolder, user, app, appUser]);

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
        syncFilesInCurrentFolder,
        enableTags,
				listTags,
				addTags,
				editTags,
				removeTags
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

const recursiveDelete = async (
  storage: FirebaseStorage,
  prefixes: StorageReference[],
  items: StorageReference[],
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

const initializeAppAndLogin = async (data: Drive, user: User, setApp: any) => {
  const has_logged_in = window.localStorage.getItem(`has_logged_in_${data.id}`) === "true" || false;
  const initialize = initializeApp(data.keys as any, data.id);
  setApp(initialize);

  if (!has_logged_in) {
    await loginTheirUser(initialize, user, data);
  }
};

const loginTheirUser = async (app: FirebaseApp, user: User, data: Drive) => {
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
      }
    });

  if (!config.password) await axios.put(`/api/drive?id=${data.id}`, { ...config, password });
};
