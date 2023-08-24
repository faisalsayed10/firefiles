import { DriveFile, FileSortConfig } from "./types";
import { sortBy } from "underscore";

export function sortDriveFiles(files: DriveFile[], fileSort: FileSortConfig): DriveFile[] {
  const sortedFiles =
    fileSort.property !== "name"
      ? sortBy(files, (file) => {
          return fileSort.property === "createdAt" ? file.createdAt : Number(file.size);
        })
      : sortByName(files);

  if (!fileSort.isAscending) sortedFiles.reverse();

  return sortedFiles;
}

const sortByName = (files: DriveFile[]) => {
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });
  return [...files].sort((a: DriveFile, b: DriveFile) => {
    return collator.compare(a.name, b.name);
  });
};
