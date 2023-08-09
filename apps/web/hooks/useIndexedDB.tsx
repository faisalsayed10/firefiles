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
      const existingFile = drive.files.find(file => file.name === fileData.name);
  
      if (existingFile) {
        console.log(`File '${fileData.name}' already exists in drive '${driveName}'.`);
        return;
      }
      const newFile = {
        name: fileData.name,
        size: fileData.size,
        url: fileData.url,
        fullPath: fileData.fullPath,
      };

      const updatedFiles = drive.files ? [...drive.files, newFile] : [newFile];
      //console.log('before', updatedFiles);
    
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

  return {
    db,
    createNewDrive,
    addFileToDrive,
    deleteFileFromDrive,
  };
};

export default useIndexedDB;