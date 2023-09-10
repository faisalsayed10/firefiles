import { useEffect, useState } from "react";
import Dexie, { Table } from "dexie";

const useIndexedDB = () => {
  const [db, setDb] = useState(null);

  // Initialize the database and create the object store
  useEffect(() => {
    const initializeDB = async () => {
      const dexieDB = new Dexie("firefiles_Drive");
      dexieDB.version(1).stores({
        drives: "++id,driveName", // id for identify, could be deleted
      });
      await dexieDB.open();
      setDb(dexieDB);
    };
    initializeDB();
  }, []); // initialize while useIndexDB

  // create a new drive
  const createNewDrive = async (driveName) => {
    if (!db) return;

    // Check if the drive with the given name already exists
    const existingDrive = await db.drives.where("driveName").equals(driveName).first();

    if (existingDrive) {
      console.log(`Drive '${driveName}' already exists.`);
      return;
    } else {
      // If the drive doesn't exist, add a new drive record with an empty files array
      await db.drives.add({ driveName, files: [], folders: [] });
      console.log(`Drive '${driveName}' created.`);
    }
  };

  // Add a new file to an existing drive - used when clicking on Drive, add new data / add new file
  const addFileToDrive = async (driveName, fileData) => {
    if (!db) return;

    const drive = await db.drives.where("driveName").equals(driveName).first();

    if (drive) {
      // Check if the file with the same name already exists in the drive
      const existingFile = drive.files.find((file) => file.fullPath === fileData.fullPath);

      // check if the file has the same path:
      if (existingFile) {
        console.log(`File '${fileData.name}' already exists in drive '${driveName}'.`);
        return;
      }
      const newFile = {
        name: fileData.name,
        size: fileData.size,
        url: fileData.url,
        fullPath: fileData.fullPath,
        contentType: fileData.contentType,
        parent: fileData.parent,
      };

      const updatedFiles = drive.files ? [...drive.files, newFile] : [newFile];

      await db.drives.update(drive.id, { files: updatedFiles });
      console.log(`File '${fileData.name}' added to drive '${driveName}'.`);
    } else {
      console.log(`Drive '${driveName}' not found.`);
    }
  };

  const addFolderToDrive = async (driveName, folderData) => {
    if (!db) return;

    const drive = await db.drives.where("driveName").equals(driveName).first();
    if (drive) {
      // Check if the file with the same name already exists in the drive
      const existingFolder = drive.folders.find(
        (folder) => folder.fullPath === folderData.fullPath,
      );

      // check if the file has the same path:
      if (existingFolder) {
        console.log(`Folder '${folderData.name}' already exists in drive '${driveName}'.`);
        return;
      }
      const newFolder = {
        name: folderData.name,
        fullPath: folderData.fullPath,
        bucketName: folderData.bucketName,
        parent: folderData.parent,
      };

      const updatedFolders = drive.folders ? [...drive.folders, newFolder] : [newFolder];
      console.log(newFolder.fullPath);

      await db.drives.update(drive.id, { folders: updatedFolders });
      console.log(`Folder '${folderData.name}' added to drive '${driveName}'.`);
    } else {
      console.log(`Drive '${driveName}' not found.`);
    }
  };

  // Delete a file from an existing drive - used for delete a file data
  const deleteFileFromDrive = async (driveName, fileFullPath) => {
    if (!db) return;

    const drive = await db.drives.where("driveName").equals(driveName).first();

    if (drive) {
      const updatedFiles = drive.files.filter((file) => file.fullPath !== fileFullPath);
      await db.drives.update(drive.id, { files: updatedFiles });

      console.log(`File '${fileFullPath}' deleted from drive '${driveName}'.`);
    } else {
      console.log(`Drive '${driveName}' not found.`);
    }
  };

  // Delete a folder, delete all files inside the folder function?
  const deleteFilesInFolder = async (driveName, folderFullPath) => {
    if (!db) return;

    const drive = await db.drives.where("driveName").equals(driveName).first();

    if (drive) {
      // if (folderFullPath === "")
      //   folderFullPath = "/";
      const folderToDelete = drive.folders.find((folder) => folder.fullPath === folderFullPath);

      if (folderToDelete.length === 0) {
        console.log(`No folder called '${folderFullPath}' found in drive '${driveName}'.`);
        return;
      }

      const updatedFiles = drive.files.filter((file) => !file.fullPath.startsWith(folderFullPath));
      const updatedFolders = drive.folders.filter((folder) => folder.fullPath !== folderFullPath);

      await db.drives.update(drive.id, { files: updatedFiles, folders: updatedFolders });

      console.log(`Deleted folder '${folderFullPath}' from drive '${driveName}'.`);
    } else {
      console.log(`Drive '${driveName}' not found.`);
    }
  };

  // find the file data with file's fullPath
  const getFileByFullPath = async (driveName, fullPath) => {
    if (!db) return null;

    const drive = await db.drives.where("driveName").equals(driveName).first();

    if (drive) {
      const file = drive.files.find((file) => file.fullPath === fullPath);
      return file || null; // Return the file if found, otherwise return null
    }

    return null; // Drive not found, return null
  };

  const deleteDbDrive = async (driveName) => {
    if (!db) return;

    const drive = await db.drives.where("driveName").equals(driveName).first();

    if (drive) {
      await db.drives.delete(drive.id);
      console.log(`Drive '${driveName}' and its data have been deleted.`);
    } else {
      console.log(`Drive '${driveName}' not found.`);
    }
  };

  const isFileInDrive = async (driveName, fullPath) => {
    if (!db) return false;

    const drive = await db.drives.where("driveName").equals(driveName).first();

    if (drive) {
      const fileExists = drive.files.some((file) => file.fullPath === fullPath);
      return fileExists;
    }

    return false;
  };

  const isCurrentFolderInDB = async (driveName, currentFolderPath) => {
    if (!db) return false;

    const drive = await db.drives.where("driveName").equals(driveName).first();

    if (drive) {
      const filesInCurrentFolder = drive.files.filter((file) => file.parent === currentFolderPath);
      const fileExistsInDB = filesInCurrentFolder.length > 0;
      return fileExistsInDB;
    }

    return false;
  };

  const getFilesInCurrentFolder = async (driveName, currentFolderPath) => {
    if (!db) return [];

    const drive = await db.drives.where("driveName").equals(driveName).first();

    if (drive) {
      const filesInCurrentFolder = drive.files.filter((file) => file.parent === currentFolderPath);
      return filesInCurrentFolder;
    }

    return [];
  };

  const getFoldersInCurrentFolder = async (driveName, currentFolderPath) => {
    if (!db) return [];

    const drive = await db.drives.where("driveName").equals(driveName).first();

    if (drive) {
      if (currentFolderPath === "") currentFolderPath = "/";
      const foldersInCurrentFolder = drive.folders.filter(
        (folder) => folder.parent === currentFolderPath,
      );
      return foldersInCurrentFolder;
    }
    return [];
  };

  const syncWithFirebaseResponse = async (driveName, currentFolderPath, apiResponse) => {
    if (!db) return;

    const drive = await db.drives.where("driveName").equals(driveName).first();

    if (drive) {
      const existingFiles = drive.files.filter((file) => file.parent === currentFolderPath);
      for (const existingFile of existingFiles) {
        const fileExistsInApiResponse = apiResponse.items.some(
          (item) => item.fullPath === existingFile.fullPath,
        );
        if (!fileExistsInApiResponse) {
          // The file does not exist in apiResponse.items
          console.log(
            `File with fullPath '${existingFile.fullPath}' does not exist in API response.`,
          );
          await deleteFileFromDrive(driveName, existingFile.fullPath);
          // Perform actions like updating or deleting the file in indexedDB
        }
      }
    }
  };

  return {
    db,
    createNewDrive,
    addFileToDrive,
    addFolderToDrive,
    deleteFileFromDrive,
    deleteFilesInFolder,
    getFileByFullPath,
    deleteDbDrive,
    isFileInDrive,
    isCurrentFolderInDB,
    getFilesInCurrentFolder,
    getFoldersInCurrentFolder,
    syncWithFirebaseResponse,
  };
};

export default useIndexedDB;
