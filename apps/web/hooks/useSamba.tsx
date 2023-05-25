import { createContext, useContext, useEffect, useRef, useState } from "react";
import SambaClient from "samba-client";
import { ContextValue, ROOT_FOLDER } from "./useBucket";
import { Drive } from "@prisma/client";
import { DriveFile, DriveFolder, UploadingFile } from "@util/types";
import toast from "react-hot-toast";
import useUser from "./useUser";
import mime from "mime";

const SambaContext = createContext<ContextValue>(null);
export default () => useContext(SambaContext);

type Props = {
    data: Drive & { keys: any };
    fullPath?: string;
};
export const SambaProvider: React.FC<Props> = ({ data, fullPath, children }) => {
    const sambaClient = new SambaClient({
        address: data.keys.address,
        username: "" || data.keys.username,
        password: "" || data.keys.password,
        domain: "WORKGROUP" || data.keys.domain,
        maxProtocol: "SMB3",
    })
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [currentFolder, setCurrentFolder] = useState<DriveFolder>(null);
    const [folders, setFolders] = useState<DriveFolder[]>(null);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [files, setFiles] = useState<DriveFile[]>(null);
    const isMounted = useRef(false);

    const addFolder = async (name: string) => {
        const path =
            currentFolder.fullPath !== ""
                ? decodeURIComponent(currentFolder.fullPath) + name + "/"
                : name + "/";
        const newFolder: DriveFolder = {
            name,
            fullPath: path,
            parent: currentFolder.fullPath
        }
        setFolders((folders) => [...folders, newFolder])
        await sambaClient.mkdir(newFolder.name, path);
        const localFolders = localStorage.getItem(`local_folders_${data.id}`);
        const folders: DriveFolder[] = localFolders ? JSON.parse(localFolders) : [];
        localStorage.setItem(`local_folders_${data.id}`, JSON.stringify([...folders, newFolder]));
    };

    const removeFolder = async (folder: DriveFolder) => {
        setFolders((folders) => folders.filter((f) => f.fullPath !== folder.fullPath));
        const localFolders = localStorage.getItem(`local_folders_${data.id}`);
        if (localFolders) {
            const folders = JSON.parse(localFolders);
            const filtered = folders.filter((f) => !f.fullPath.includes(folder.fullPath));
            localStorage.setItem(`local_folders_${data.id}`, JSON.stringify(filtered));
        }
        await sambaClient.deleteFile(folder.fullPath)
    }

    const addFile = async (filesToUpload: File[] | FileList) => {
        Array.from(filesToUpload).forEach(async (file) => {
            if (/[#\$\[\]\*/]/.test(file.name))
                return toast.error("File name cannot contain special characters (#$[]*/).");

            const Key =
                currentFolder === ROOT_FOLDER
                    ? file.name
                    : `${decodeURIComponent(currentFolder.fullPath)}${file.name}`;
            if (await sambaClient.fileExists(file.name, Key)) {
                return toast.error("File with same name already exists.");
            }
            await sambaClient.sendFile(file.name, Key)
        })
    }

    const removeFile = async (file: DriveFile) => {
        setFiles((files) => files.filter((f) => f.fullPath !== file.fullPath));
        await sambaClient.deleteFile(file.fullPath);
        return true;
    }

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
            parent: fullPath.split("/").shift() + "/",
        });
    }, [fullPath, user]);

    // get files and folders
    useEffect(() => {
        if (!user?.email || !currentFolder) return;
        setLoading(true);

        (async () => {
            try {
                if (!files) {
                    var results = await sambaClient.list(currentFolder.fullPath)
                    results.forEach(async (result) => {
                        const driveFile: DriveFile = {
                            fullPath: currentFolder.fullPath + "/" + result.name,
                            name: result.name.split("/").pop(),
                            parent: currentFolder.fullPath,
                            createdAt: result.modifyTime.toISOString(),
                            size: result.size.toString(),
                            contentType: mime.lookup(result.type) || "",
                        };

                        setFiles((files) => (files ? [...files, driveFile] : [driveFile]));
                    });

                    const localFolders = localStorage.getItem(`local_folders_${data.id}`);
                    setLoading(false);
                }
            }
            catch (err) {
                console.error(err);
            }
        })
    }, [currentFolder, user]);

    return (
        <SambaContext.Provider
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
        </SambaContext.Provider>
    );
};
