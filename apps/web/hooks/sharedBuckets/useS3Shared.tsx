import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { calculateVariablePartSize, parseXML2JSON } from "@util/helpers/s3-helpers";
import { DriveFile, DriveFolder, Provider, StorageDrive, UploadingFile } from "@util/types";
import { Upload } from "@util/upload";
import mime from "mime-types";
import { nanoid } from "nanoid";
import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ContextValue, ROOT_FOLDER } from "../useBucket";
import useUser from "../useUser";
import axios from "axios";

const S3SharedContext = createContext<ContextValue>(null);
export default () => useContext(S3SharedContext);

type Props = {
  data: StorageDrive;
  fullPath?: string;
};

export const S3SharedProvider: React.FC<PropsWithChildren<Props>> = ({
  data,
  fullPath,
  children,
}) => {
  const [s3Client, setS3Client] = useState<S3Client>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const [currentFolder, setCurrentFolder] = useState<DriveFolder>(null);
  const [folders, setFolders] = useState<DriveFolder[]>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [files, setFiles] = useState<DriveFile[]>(null);
  const isMounted = useRef(false);

  if (data.environment !== "client" || data.type !== "s3") {
    return;
  }

  // Fallback for old buckets not already having the bucketUrl.
  useEffect(() => {
    if (isMounted.current || !data?.keys) return;
    isMounted.current = true;
    if (data.keys.bucketUrl) return;

    if ((Provider[data.type] as Provider) === Provider.s3) {
      data.keys.bucketUrl = `https://${data.keys.Bucket}.s3.${data.keys.region}.amazonaws.com`;
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
    // TODO: Change to Shared functionality
    await emptyS3Directory(s3Client, folder.bucketName, folder.fullPath);
  };

  const addFile = async (filesToUpload: File[] | FileList) => {
    Array.from(filesToUpload).forEach(async (file) => {
      if (/[#\$\[\]\*/]/.test(file.name))
        return toast.error("File name cannot contain special characters (#$[]*/).");

      if (files?.filter((f) => f.name === file.name).length > 0)
        return toast.error("File with same name already exists.");

      const id = nanoid();
      const Key =
        currentFolder === ROOT_FOLDER
          ? file.name
          : `${decodeURIComponent(currentFolder.fullPath)}${file.name}`;

      // TODO: Can we have this operation done in the client?
      const upload = new Upload({
        client: s3Client,
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
                    parseFloat(((progress.loaded / progress.total) * 100).toString()).toFixed(2),
                  ),
                }
              : uploadFile;
          }),
        );
      });

      upload.on("paused", () => {
        setUploadingFiles((prevUploadingFiles) =>
          prevUploadingFiles.map((uploadFile) => {
            return uploadFile.id === id ? { ...uploadFile, state: "paused" } : uploadFile;
          }),
        );
      });

      upload.on("resumed", () => {
        setUploadingFiles((prevUploadingFiles) =>
          prevUploadingFiles.map((uploadFile) => {
            return uploadFile.id === id ? { ...uploadFile, state: "running" } : uploadFile;
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
        const {
          data: { getObjectUrl: url },
        } = await axios.get(`/api/file?driveId=${data.id}&fullPath=${Key}`);

        const newFile: DriveFile = {
          fullPath: Key,
          name: file.name,
          parent: currentFolder.fullPath,
          size: file.size.toString(),
          createdAt: new Date().toISOString(),
          contentType: mime.lookup(file.name) || "application/octet-stream",
          bucketName: data.keys.Bucket,
          bucketUrl: `https://${data.keys.Bucket}.s3.${data.keys.region}.amazonaws.com`,
          url,
        };

        setFiles((files) => (files ? [...files, newFile] : [newFile]));
        toast.success("File uploaded successfully.");
      });

      await upload.start();
    });
  };

  const removeFile = async (file: DriveFile) => {
    setFiles((files) => files.filter((f) => f.fullPath !== file.fullPath));
    const deleteResponse = await axios.delete<string>(
      `/api/files?driveId=${data.id}&fullPath=${file.fullPath}`,
    );
    const deleteFileUrl = deleteResponse.data;
    await axios.delete(deleteFileUrl);
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
      bucketUrl: data.keys.bucketUrl,
    });
  }, [fullPath, user]);

  // get files and folders
  useEffect(() => {
    if (!user?.email || !currentFolder) return;
    setLoading(true);

    (async () => {
      try {
        if (!files) {
          const listObjectsResponse = await fetchS3ObjectsList(
            data.id,
            currentFolder.fullPath,
            "/",
          );
          let results = listObjectsResponse.results;
          if (Array.isArray(results.Contents)) {
            const driveFiles = await Promise.all(
              results.Contents.map(async (result) => {
                const {
                  data: { getObjectUrl: url },
                } = await axios.get(`/api/file?driveId=${data.id}&fullPath=${result.Key}`);
                return {
                  fullPath: result.Key,
                  name: result.Key.split("/").pop(),
                  parent: currentFolder.fullPath,
                  createdAt: new Date(result.LastModified).toISOString(),
                  size: result.Size.toString(),
                  contentType: mime.lookup(result.Key) || "",
                  bucketName: results.Name,
                  bucketUrl: data.keys.bucketUrl,
                  url,
                };
              }),
            );

            setFiles(driveFiles);
          }

          const localFolders = localStorage.getItem(`local_folders_${data.id}`);
          let localFoldersArray: DriveFolder[] = localFolders ? JSON.parse(localFolders) : [];
          localFoldersArray = localFoldersArray.filter(
            (folder) =>
              folder.parent === currentFolder.fullPath &&
              !results.CommonPrefixes?.find((prefix) => prefix.Prefix === folder.fullPath),
          );

          setFolders(localFoldersArray);

          if (results.CommonPrefixes) {
            for (let i = 0; i < results.CommonPrefixes.length; i++) {
              const driveFolder: DriveFolder = {
                fullPath: results.CommonPrefixes[i].Prefix,
                name: results.CommonPrefixes[i].Prefix.slice(0, -1).split("/").pop(),
                bucketName: results.Name,
                parent: currentFolder.fullPath,
                bucketUrl: data.keys.bucketUrl,
              };
              setFolders((folders) => [...folders, driveFolder]);
            }
          }

          // loop to list all files.
          while (results.IsTruncated) {
            const listObjectsResponse = await fetchS3ObjectsList(
              data.id,
              currentFolder.fullPath,
              "/",
              results.ContinuationToken,
            );
            results = listObjectsResponse.results;
            if (!Array.isArray(results.Contents)) break;

            const driveFiles = await Promise.all(
              results.Contents.map(async (result) => {
                const {
                  data: { getObjectUrl: url },
                } = await axios.get(`/api/file?driveId=${data.id}&fullPath=${result.Key}`);
                return {
                  fullPath: result.Key,
                  name: result.Key.split("/").pop(),
                  parent: currentFolder.fullPath,
                  createdAt: new Date(result.LastModified).toISOString(),
                  size: result.Size.toString(),
                  contentType: mime.lookup(result.Key) || "",
                  bucketName: results.Name,
                  bucketUrl: data.keys.bucketUrl,
                  url,
                };
              }),
            );
            setFiles((files) => (files ? [...files, ...driveFiles] : driveFiles));
          }
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    })();
  }, [currentFolder, user]);

  return (
    <S3SharedContext.Provider
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
    </S3SharedContext.Provider>
  );
};

async function emptyS3Directory(
  client: S3Client, // TODO:
  Bucket: string,
  Prefix: string,
) {
  const listParams = { Bucket, Prefix };
  const listedObjects = await client.send(new ListObjectsV2Command(listParams)); // TODO:

  if (listedObjects.CommonPrefixes?.length > 0) {
    for (let i = 0; i < listedObjects.CommonPrefixes.length; i++) {
      await emptyS3Directory(
        // TODO:
        client,
        Bucket,
        listedObjects.CommonPrefixes[i].Prefix,
      );
    }
  }

  if (listedObjects.Contents?.length === 0) return;

  const deleteParams = { Bucket, Delete: { Objects: [] } };

  for (let i = 0; i < listedObjects.Contents.length; i++) {
    deleteParams.Delete.Objects.push({ Key: listedObjects.Contents[i].Key });
  }

  await client.send(new DeleteObjectsCommand(deleteParams)); // TODO:
  if (listedObjects.IsTruncated) await emptyS3Directory(client, Bucket, Prefix);
}

const fetchS3ObjectsList = async (
  driveId: string,
  fullPath: string,
  delimiter?: string,
  continuationToken?: string,
) => {
  const getListObjectsUrlResponse = await axios.get(
    `/api/files?driveId=${driveId}&fullPath=${fullPath}${
      continuationToken ? `&continuationToken=${continuationToken}` : ""
    }${delimiter ? `&delimiter=${delimiter}` : ""}`,
  );
  const objectsListResponse = await axios.get(getListObjectsUrlResponse.data.getObjectsListUrl);
  const parseResult = parseXML2JSON(objectsListResponse.data);
  if (!parseResult.success) throw new Error(parseResult.error);
  const results: ListObjectsV2CommandOutput = parseResult.json.ListBucketResult;
  return { success: true, results };
};
