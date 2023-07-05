import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    S3Client,
  } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  import { Drive } from "@prisma/client";
  import { calculateVariablePartSize } from "@util/helpers/s3-helpers";
  import { DriveFile, DriveFolder, Provider, UploadingFile } from "@util/types";
  import { Upload } from "@util/upload";
  import mime from "mime-types";
  import { nanoid } from "nanoid";
  import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useRef,
    useState,
  } from "react";
  import toast from "react-hot-toast";
  import { ContextValue, ROOT_FOLDER } from "./useBucket";
  import useUser from "./useUser";
  
  const WasabiContext = createContext<ContextValue>(null);
  export default () => useContext(WasabiContext);
  
  type Props = {
    data: Drive & { keys: any };
    fullPath?: string;
  };
  
  export const WasabiProvider: React.FC<PropsWithChildren<Props>> = ({
    data,
    fullPath,
    children,
  }) => {
    const [wasabiClient, setWasabiClient] = useState<S3Client>(
      new S3Client({
        region: data.keys.region,
        maxAttempts: 1,
        credentials: {
          accessKeyId: data.keys.accessKey,
          secretAccessKey: data.keys.secretKey,
        },
        ...(data.keys?.endpoint ? { endpoint: data.keys.endpoint } : {}),
      }),
    );
    const [loading, setLoading] = useState(false);
    const { user } = useUser();
  
    const [currentFolder, setCurrentFolder] = useState<DriveFolder>(null);
    const [folders, setFolders] = useState<DriveFolder[]>(null);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [files, setFiles] = useState<DriveFile[]>(null);
    const isMounted = useRef(false);
  
    // Fallback for old buckets not already having the bucketUrl.
    useEffect(() => {
      if (isMounted.current || !data?.keys) return;
      isMounted.current = true;
      if (data.keys.bucketUrl) return;
  
      if ((Provider[data.type] as Provider) === Provider.s3) {
        data.keys.bucketUrl = `https://${data.keys.Bucket}.s3.${data.keys.region}.wasabisys.com`;
      } else if ((Provider[data.type] as Provider) === Provider.backblaze) {
        data.keys.bucketUrl = `https://${data.keys.Bucket}.s3.${data.keys.region}.backblazeb2.com`;
      }
  
      return () => {
        isMounted.current = false;
      };
    }, [data]);
  
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
        bucketUrl: data.keys.bucketUrl,
      };
  
      setFolders((folders) => [...folders, newFolder]);
      const localFolders = localStorage.getItem(`local_folders_${data.id}`);
      const folders: DriveFolder[] = localFolders ? JSON.parse(localFolders) : [];
  localStorage.setItem(
        `local_folders_${data.id}`,
        JSON.stringify([...folders, newFolder]),
      );
    };
  
    const removeFolder = async (folder: DriveFolder) => {
      // remove from local state
      setFolders((folders) =>
        folders.filter((f) => f.fullPath !== folder.fullPath),
      );
  
      // delete from localStorage
      const localFolders = localStorage.getItem(`local_folders_${data.id}`);
      if (localFolders) {
        const folders = JSON.parse(localFolders);
        const filtered = folders.filter(
          (f) => !f.fullPath.includes(folder.fullPath),
        );
        localStorage.setItem(
          `local_folders_${data.id}`,
          JSON.stringify(filtered),
        );
      }
  
      // recursively delete children
      await emptyS3Directory(wasabiClient, folder.bucketName, folder.fullPath);
    };
  
    const addFile = async (filesToUpload: File[] | FileList) => {
      Array.from(filesToUpload).forEach(async (file) => {
        if (/[#\$\[\]\*/]/.test(file.name))
          return toast.error(
            "File name cannot contain special characters (#$[]*/).",
          );
  
        if (files?.filter((f) => f.name === file.name).length > 0)
          return toast.error("File with same name already exists.");
  
        const id = nanoid();
        const Key =
          currentFolder === ROOT_FOLDER
            ? file.name
            : `${decodeURIComponent(currentFolder.fullPath)}${file.name}`;
  
        const upload = new Upload({
          client: wasabiClient,
          params: {
            Key,
            Body: file,
            Bucket: data.keys.Bucket,
            ContentType: mime.lookup(file.name) || "application/octet-stream",
          },
          partSize: calculateVariablePartSize(file.size),
        });
  
        upload.on("initiated", () => {
          setUploadingFiles((prev) =>
            prev.concat([
              {
                id,
                name: file.name,
                key: Key,
                task: upload,
                state: "running",
                progress: 0,
                error: false,
              },
            ]),
          );
        });
  
        upload.on("progress", (progress) => {
          setUploadingFiles((prevUploadingFiles) =>
            prevUploadingFiles.map((uploadFile) => {
              return uploadFile.id === id
                ? {
                    ...uploadFile,
                    state: "running",
                    progress: Number(
                      parseFloat(
                        ((progress.loaded / progress.total) * 100).toString(),
                      ).toFixed(2),
                    ),
                  }
                : uploadFile;
            }),
          );
        });
  
        upload.on("paused", () => {
          setUploadingFiles((prevUploadingFiles) =>
            prevUploadingFiles.map((uploadFile) => {
              return uploadFile.id === id
                ? { ...uploadFile, state: "paused" }
                : uploadFile;
            }),
          );
        });
  
        upload.on("resumed", () => {
          setUploadingFiles((prevUploadingFiles) =>
            prevUploadingFiles.map((uploadFile) => {
              return uploadFile.id === id
                ? { ...uploadFile, state: "running" }
                : uploadFile;
            }),
          );
        });
  
        upload.on("error", (err) => {
          toast.error(err.message);
          setUploadingFiles((prevUploadingFiles) => {
            return prevUploadingFiles.map((uploadFile) => {
              if (uploadFile.id === id) return { ...uploadFile, error: true };
              return uploadFile;
            });
          });
        });
  
        upload.on("completed", async () => {
          setUploadingFiles((prevUploadingFiles) =>
           prevUploadingFiles.filter((uploadFile) => uploadFile.id !== id),
          );
  
          const newFile: DriveFile = {
            id,
            name: file.name,
            fullPath: Key,
            parent: currentFolder.fullPath,
            size: file.size,
            createdAt: new Date().toISOString(),
            bucketName: data.keys.Bucket,
            bucketUrl: data.keys.bucketUrl,
          };
  
          setFiles((files) => (files ? [...files, newFile] : [newFile]));
  
          const localFiles = localStorage.getItem(`local_files_${data.id}`);
          const files: DriveFile[] = localFiles ? JSON.parse(localFiles) : [];
          localStorage.setItem(
            `local_files_${data.id}`,
            JSON.stringify([...files, newFile]),
          );
        });
  
        await upload.start();
      });
    };
  
    const removeFile = async (file: DriveFile) => {
      // remove from local state
      setFiles((files) => files.filter((f) => f.fullPath !== file.fullPath));
  
      // delete from localStorage
      const localFiles = localStorage.getItem(`local_files_${data.id}`);
      if (localFiles) {
        const files = JSON.parse(localFiles);
        const filtered = files.filter((f) => !f.fullPath.includes(file.fullPath));
        localStorage.setItem(
          `local_files_${data.id}`,
          JSON.stringify(filtered),
        );
      }
  
      // delete from S3
      const params = {
        Bucket: file.bucketName,
        Key: file.fullPath,
      };
  
      try {
        await wasabiClient.send(new DeleteObjectCommand(params));
      } catch (error) {
        toast.error("Failed to delete file.");
        console.error(error);
      }
    };
  
    const renameFile = async (file: DriveFile, newName: string) => {
      if (file.name === newName) return;
  
      // update local state
      setFiles((files) =>
        files.map((f) => {
          if (f.fullPath === file.fullPath) {
            return { ...f, name: newName };
          }
          return f;
        }),
      );
  
      // update localStorage
      const localFiles = localStorage.getItem(`local_files_${data.id}`);
      if (localFiles) {
        const files = JSON.parse(localFiles);
        const updated = files.map((f) => {
          if (f.fullPath === file.fullPath) {
            return { ...f, name: newName };
          }
          return f;
        });
        localStorage.setItem(
          `local_files_${data.id}`,
          JSON.stringify(updated),
        );
      }
  
      // rename file in S3
      const newKey =
        currentFolder === ROOT_FOLDER
          ? newName
          : `${decodeURIComponent(currentFolder.fullPath)}${newName}`;
  
      const copyParams = {
        Bucket: file.bucketName,
        CopySource: `${file.bucketName}/${file.fullPath}`,
        Key: newKey,
        MetadataDirective: "COPY",
        ContentType: mime.lookup(newName) || "application/octet-stream",
      };
  
      const deleteParams = {
        Bucket: file.bucketName,
        Key: file.fullPath,
      };
  
      try {
        await wasabiClient.send(new CopyObjectCommand(copyParams));
        await wasabiClient.send(new DeleteObjectCommand(deleteParams));
      } catch (error) {
        toast.error("Failed to rename file.");
        console.error(error);
      }
    };
  
    const emptyS3Directory = async (
      client: S3Client,
      bucket: string,
      dir: string,
    ) => {
      const listParams = {
        Bucket: bucket,
        Prefix: dir,
      };
  
      const listObjects = await client.send(new ListObjectsV2Command(listParams));
  
      if (listObjects.Contents.length === 0) return;
  
      const deleteParams: DeleteObjectsCommand = {
        Bucket: bucket,
        Delete: { Objects: [] },
      };
  
      listObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
      });
  
      await client.send(new DeleteObjectsCommand(deleteParams));
  
      if (listObjects.IsTruncated) {
        await emptyS3Directory(client, bucket, dir);
      }
    };
  
    const downloadFile = async (file: DriveFile) => {
      const params = {
        Bucket: file.bucketName,
        Key: file.fullPath,
      };
  
      try {
        const command = new GetObjectCommand(params);
        const signedUrl = await getSignedUrl(wasabiClient, command, {
          expiresIn: 3600,
        });
        window.open(signedUrl, "_blank");
      } catch (error) {
        toast.error("Failed to download file.");
        console.error(error);
      }
    };
  
    useEffect(() => {
      if (fullPath) {
        const decodedPath = decodeURIComponent(fullPath);
        setCurrentFolder({
          name: decodedPath.split("/").pop(),
          fullPath: decodedPath,
          parent: decodedPath.split("/").slice(0, -1).join("/") || "/",
          createdAt: null,
          bucketName: data.keys.Bucket,
          bucketUrl: data.keys.bucketUrl,
        });
      } else {
        setCurrentFolder(ROOT_FOLDER);
      }
    }, [fullPath]);
  
    useEffect(() => {
      if (!data?.keys) return;
  
      const localFolders = localStorage.getItem(`local_folders_${data.id}`);
      const folders: DriveFolder[] = localFolders ? JSON.parse(localFolders) : [];
  
      setFolders(folders);
  
      const localFiles = localStorage.getItem(`local_files_${data.id}`);
      const files: DriveFile[] = localFiles ? JSON.parse(localFiles) : [];
  
      setFiles(files);
  
      return () => {
        isMounted.current = false;
      };
    }, [data]);
  
    return (
      <WasabiContext.Provider
        value={{
          loading,
          currentFolder,
          folders,
          files,
          uploadingFiles,
          addFolder,
          removeFolder,
          addFile,
          removeFile,
          renameFile,
          downloadFile,
        }}
      >
        {children}
      </WasabiContext.Provider>
    );
  };
  