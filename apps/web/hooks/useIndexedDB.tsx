import { useEffect, useState } from "react";
import Dexie, { Table } from 'dexie';

const useIndexedDB = () => {
  const [db, setDb] = useState(null);

  // Initialize the database and create the object store
  useEffect(() => {
    const initializeDB = async () => {
      const dexieDB = new Dexie('firefiles_Drive');
      dexieDB.version(1).stores({
        drives: '++id,driveName', // id for identify, could be deleted
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
    const existingDrive = await db.drives.where('driveName').equals(driveName).first();

    if (existingDrive) {
      console.log(`Drive '${driveName}' already exists.`);
    } else {
      // If the drive doesn't exist, add a new drive record with an empty files array
      await db.drives.add({ driveName, files: [] });

      console.log(`Drive '${driveName}' created.`);
    }
  };

  // Add a new file to an existing drive - used when clicking on Drive, add new data / add new file
  const addFileToDrive = async (driveName, fileData) => {
    if (!db) return;

    const drive = await db.drives.where('driveName').equals(driveName).first();
    //console.log(drive);
    if (drive) {
      // Check if the file with the same name already exists in the drive
      const existingFile = drive.files.find(file => file.fullPath === fileData.fullPath);
      // if (existingFile) {
      //   console.log("this is the existing File " + existingFile.name + ' and full path ' + existingFile.fullPath);
      //   console.log(existingFile.fullPath + ' ' + fileData.fullPath);
      // }

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
      };

      const updatedFiles = drive.files ? [...drive.files, newFile] : [newFile];
      //console.log('before', updatedFiles);
      console.log(newFile.fullPath);

      await db.drives.update(drive.id, { files: updatedFiles });
      console.log(`File '${fileData.name}' added to drive '${driveName}'.`);
    } else {
      console.log(`Drive '${driveName}' not found.`);
    }
  };

  // Delete a file from an existing drive - used for delete a file data
  const deleteFileFromDrive = async (driveName, fileName) => {
    if (!db) return;

    const drive = await db.drives.where('driveName').equals(driveName).first();

    if (drive) {
      const updatedFiles = drive.files.filter((file) => file.name !== fileName);
      await db.drives.update(drive.id, { files: updatedFiles });

      console.log(`File '${fileName}' deleted from drive '${driveName}'.`);
    } else {
      console.log(`Drive '${driveName}' not found.`);
    }
  };

  // Delete a folder, delete all files inside the folder function?
  const deleteFilesInFolder = async (driveName, folderName) => {
    if (!db) return;

    const drive = await db.drives.where('driveName').equals(driveName).first();

    if (drive) {
      const filesToDelete = drive.files.filter(file => file.fullPath.startsWith(folderName));

      if (filesToDelete.length === 0) {
        console.log(`No files found in folder '${folderName}' of drive '${driveName}'.`);
        return;
      }

      const updatedFiles = drive.files.filter(file => !file.fullPath.startsWith(folderName + '/'));
      await db.drives.update(drive.id, { files: updatedFiles });

      console.log(`Deleted ${filesToDelete.length} files from folder '${folderName}' of drive '${driveName}'.`);
    } else {
      console.log(`Drive '${driveName}' not found.`);
    }
  };

  // find the file data with file's fullPath
  const getFileByFullPath = async (driveName, fullPath) => {
    if (!db) return null;

    const drive = await db.drives.where('driveName').equals(driveName).first();

    if (drive) {
      const file = drive.files.find(file => file.fullPath === fullPath);
      //console.log('File found:', file);
      return file || null; // Return the file if found, otherwise return null
    }

    return null; // Drive not found, return null
  };

  const deleteDbDrive = async (driveName) => {
    if (!db) return;
  
    const drive = await db.drives.where('driveName').equals(driveName).first();
  
    if (drive) {
      await db.drives.delete(drive.id);
      console.log(`Drive '${driveName}' and its data have been deleted.`);
    } else {
      console.log(`Drive '${driveName}' not found.`);
    }
  };

  const isFileInDrive = async (driveName, fullPath) => {
    if (!db) return false;
  
    const drive = await db.drives.where('driveName').equals(driveName).first();
  
    if (drive) {
      const fileExists = drive.files.some(file => file.fullPath === fullPath);
      return fileExists;
    }
  
    return false; // Drive not found, so the file can't exist in it
  };

  return {
    db,
    createNewDrive,
    addFileToDrive,
    deleteFileFromDrive,
    deleteFilesInFolder,
    getFileByFullPath,
    deleteDbDrive,
    isFileInDrive,
  };
};

export default useIndexedDB;