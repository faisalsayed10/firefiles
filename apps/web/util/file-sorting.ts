import { DriveFile, FileSortConfig } from "./types";
import { sortBy } from "underscore";

export function sortDriveFiles(
	files: DriveFile[],
	fileSort: FileSortConfig,
): DriveFile[] {
	const sortedFiles =
		fileSort.property !== "name"
			? sortBy(files, (file) => {
					return fileSort.property === "createdAt"
						? file.createdAt
						: Number(file.size);
			  })
			: sortByName(files);

	if (!fileSort.isAscending) sortedFiles.reverse();

	return sortedFiles;
}

const sortByName = (files: DriveFile[]) => {
  const digitSorted = sortBy(files, file => {
    const regex = /^(\d+)?(.*)$/;
    const [, num, _] = regex.exec(file.name);
    return num ? parseInt(num, 10) : Number.POSITIVE_INFINITY;
  });
  const nameSorted = sortBy(digitSorted, file => {
    const regex = /^(\d+)?(.*)$/;
    const [, _, text] = regex.exec(file.name);
    return text;
  })
  return nameSorted;
}
