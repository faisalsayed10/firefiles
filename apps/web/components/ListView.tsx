import FilesEmptyState from "@components/files/FilesEmptyState";
import FilesTable from "@components/files/FilesTable";
import FilesTableSkeleton from "@components/files/FilesTableSkeleton";
import AddFolderButton from "@components/folders/AddFolderButton";
import Folder from "@components/folders/Folder";
import { DriveFile, DriveFolder } from "@util/types";
import React from "react";
import Skeleton from "react-loading-skeleton";
import { LayoutGrid } from "tabler-icons-react";

type Props = {
	setGridView: React.Dispatch<React.SetStateAction<boolean>>;
	loading: boolean;
	currentFolder: DriveFolder;
	folders: DriveFolder[];
	files: DriveFile[];
	setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
};

const ListView: React.FC<Props> = (props) => {
	return (
		<>
			{props.loading ? (
				<div className="mx-4 mb-6 gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					<Skeleton className="h-36 w-full rounded-lg" />
					<Skeleton className="h-36 w-full rounded-lg" />
					<Skeleton className="h-36 w-full rounded-lg" />
					<Skeleton className="h-36 w-full rounded-lg" />
				</div>
			) : (
				<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 p-5">
					{props.folders?.map((f) => (
						<Folder key={f.name} setIsFolderDeleting={props.setIsFolderDeleting} folder={f} />
					))}
					<AddFolderButton currentFolder={props.currentFolder} />
				</div>
			)}
			<hr />
			<div className="flex items-center justify-between m-5">
				<h2 className="text-2xl font-semibold">Your Files</h2>
				<button className="hover:bg-gray-50" aria-label="change-view" onClick={() => props.setGridView(true)}>
					<LayoutGrid />
				</button>
			</div>
			{props.files === null && props.loading ? (
				<FilesTableSkeleton />
			) : !props.files || props.files?.length === 0 ? (
				<FilesEmptyState />
			) : (
				<FilesTable files={props.files} />
			)}
		</>
	);
};

export default ListView;
