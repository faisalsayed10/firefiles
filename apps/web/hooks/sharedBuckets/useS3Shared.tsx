import {
  PutObjectTaggingCommand,
  GetObjectTaggingCommand,
  S3Client,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { calculateVariablePartSize, parseXML2JSON } from "@util/helpers/s3-helpers";
import { DriveFile, DriveFolder, Provider, Tag, StorageDrive, UploadingFile } from "@util/types";
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
  if (data.environment !== "client" || data.type === "firebase") {
    toast.error("Drive type invalid for SharedS3 Provider.");
    return;
  }

  // TODO: S3 object should be moved off client entirely
  const [s3Client, setS3Client] = useState<S3Client>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const [currentFolder, setCurrentFolder] = useState<DriveFolder>(null);
  const [folders, setFolders] = useState<DriveFolder[]>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [files, setFiles] = useState<DriveFile[]>(null);
  const isMounted = useRef(false);
  // TODO: Add tag support for shared drives (server-side GET/POST/PUT/DELETE)
  const enableTags = data.supportsTagging;

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

    await emptyS3Directory(data.id, folder.bucketName, folder.fullPath);
  };

  const addFile = async (filesToUpload: File[] | FileList) => {
    Array.from(filesToUpload).forEach(async (file) => {
      if (!data.supportsUploading) {
        // TODO: Add this support
        toast.error("Drive provider does not yet support file uploading.");
        return;
      }

      if (/[#\$\[\]\*/]/.test(file.name))
        return toast.error("File name cannot contain special characters (#$[]*/).");

      if (files?.filter((f) => f.name === file.name).length > 0)
        return toast.error("File with same name already exists.");

      const id = nanoid();
      const Key =
        currentFolder === ROOT_FOLDER
          ? file.name
          : `${decodeURIComponent(currentFolder.fullPath)}${file.name}`;

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
    const deleteObjectResponse = await axios.delete(
      `/api/file?driveId=${data.id}&fullPath=${file.fullPath}`,
    );
    const deleteFileUrl = deleteObjectResponse.data.deleteObjectUrl;
    await axios.delete(deleteFileUrl);
    return true;
  };

  // To be implemented
  const syncFilesInCurrentFolder = async () => {
    return () => {};
  };

  // get array of tags
  const listTags = async (file: DriveFile): Promise<Tag[] | void> => {
    if (!data.supportsUploading) {
      // TODO: Add this support
      return;
    }
    try {
      const response = await s3Client.send(
        new GetObjectTaggingCommand({ Bucket: data.keys.Bucket, Key: file.fullPath }),
      );
      return response.TagSet.map((tag) => ({ key: tag.Key, value: tag.Value }));
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  // add tag to existing object
  const addTags = async (file: DriveFile, key: string, value: string): Promise<boolean> => {
    if (!key.trim()) {
      toast.error("Error: Tag key is blank.");
      return false;
    }
    key = key.trim();
    const currentTagsResponse = await s3Client.send(
      new GetObjectTaggingCommand({
        Bucket: data.keys.Bucket,
        Key: file.fullPath,
      }),
    );
    const currentTags = currentTagsResponse.TagSet;
    currentTags.push({ Key: key, Value: value });
    const params = {
      Bucket: data.keys.Bucket,
      Key: file.fullPath,
      Tagging: { TagSet: currentTags },
    };

    try {
      await s3Client.send(new PutObjectTaggingCommand(params));
      return true;
    } catch (err) {
      toast.error(`Error: ${err.message}`);
      return false;
    }
  };

  // edit existing tag
  const editTags = async (file: DriveFile, prevTag: Tag, newTag: Tag): Promise<boolean> => {
    // remove previous tag in order to edit
    if (!(await removeTags(file, prevTag.key))) {
      return false;
    } else {
      // add the new tag
      if (await addTags(file, newTag.key, newTag.value)) {
        return true;
      } else {
        // if new tag values are invalid, add back the previous tag
        await addTags(file, prevTag.key, prevTag.value);
        toast.error(`Error: Tag not edited.`);
        return false;
      }
    }
  };

  // remove tag from an object
  const removeTags = async (file: DriveFile, key: string): Promise<boolean> => {
    const getTagging = await s3Client.send(
      new GetObjectTaggingCommand({ Bucket: data.keys.Bucket, Key: file.fullPath }),
    );
    let existingTags = getTagging.TagSet;
    const updatedTags = existingTags.filter((tag) => tag.Key !== key);

    const putTagging = {
      Bucket: data.keys.Bucket,
      Key: file.fullPath,
      Tagging: { TagSet: updatedTags },
    };

    try {
      await s3Client.send(new PutObjectTaggingCommand(putTagging));
      return true;
    } catch (err) {
      toast.error(`Error: ${err.message}`);
      return false;
    }
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
          const contents = Array.isArray(listObjectsResponse.results.Contents)
            ? listObjectsResponse.results.Contents
            : [listObjectsResponse.results.Contents];
          if (contents.length > 0) {
            const driveFiles = await Promise.all(
              contents.map(async (result) => {
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
          const commonPrefixes = Array.isArray(listObjectsResponse.results.CommonPrefixes)
            ? listObjectsResponse.results.CommonPrefixes
            : [listObjectsResponse.results.CommonPrefixes];
          localFoldersArray = localFoldersArray.filter(
            (folder) =>
              folder.parent === currentFolder.fullPath &&
              !commonPrefixes?.find((prefix) => prefix.Prefix === folder.fullPath),
          );

          setFolders(localFoldersArray);

          if (commonPrefixes.length > 0) {
            for (let i = 0; i < commonPrefixes.length; i++) {
              const driveFolder: DriveFolder = {
                fullPath: commonPrefixes[i].Prefix,
                name: commonPrefixes[i].Prefix.slice(0, -1).split("/").pop(),
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
            const contents = Array.isArray(listObjectsResponse.results.Contents)
              ? listObjectsResponse.results.Contents
              : [listObjectsResponse.results.Contents];
            if (contents.length === 0) break;

            const driveFiles = await Promise.all(
              contents.map(async (result) => {
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
        syncFilesInCurrentFolder,
        enableTags,
        listTags,
        addTags,
        editTags,
        removeTags,
      }}
    >
      {children}
    </S3SharedContext.Provider>
  );
};

async function emptyS3Directory(driveId: string, Bucket: string, Prefix: string) {
  const fetchedObjectsList = await fetchS3ObjectsList(driveId, Prefix);
  if (!fetchedObjectsList.success) return;

  const contents = Array.isArray(fetchedObjectsList.results.Contents)
    ? fetchedObjectsList.results.Contents
    : [fetchedObjectsList.results.Contents];

  const commonPrefixes = Array.isArray(fetchedObjectsList.results.CommonPrefixes)
    ? fetchedObjectsList.results.CommonPrefixes
    : [fetchedObjectsList.results.CommonPrefixes];

  if (commonPrefixes[0]) {
    for (let i = 0; i < commonPrefixes.length; i++) {
      await emptyS3Directory(driveId, Bucket, commonPrefixes[i].Prefix);
    }
  }
  if (!contents[0]) return;

  const deleteParams = { Bucket, Delete: { Objects: [] } };
  for (let i = 0; i < contents.length; i++) {
    deleteParams.Delete.Objects.push({ Key: contents[i].Key });
  }

  await axios.delete(`/api/files?driveId=${driveId}&deleteParams=${JSON.stringify(deleteParams)}`);

  if (fetchedObjectsList.results.IsTruncated) await emptyS3Directory(driveId, Bucket, Prefix);
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
