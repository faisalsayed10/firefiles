import { createContext, useContext, useRef, useState } from "react";
import SambaClient from "samba-client";
import { ContextValue, ROOT_FOLDER } from "./useBucket";
import { Drive } from "@prisma/client";
import { DriveFile, DriveFolder, UploadingFile } from "@util/types";

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
};
