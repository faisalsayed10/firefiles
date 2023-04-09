import Folder from "@components/folders/Folder";
import { DriveFile, DriveFolder } from "@util/types";
import React from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { LayoutList } from "tabler-icons-react";
import File from "./files/File";
import AddFolderButton from "./folders/AddFolderButton";

type Props = {
	setGridView: React.Dispatch<React.SetStateAction<boolean>>;
	loading: boolean;
	currentFolder: DriveFolder;
	folders: DriveFolder[];
	files: DriveFile[];
	setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
};

const GridView: React.FC<Props> = (props) => {
	return (
		<div className="mx-4 mb-6">
			<div className="flex items-center justify-between my-4">
				<h2 className="text-2xl font-semibold">Your Files</h2>
				<button aria-label="change-view" onClick={() => props.setGridView(false)}>
					<LayoutList />
				</button>
			</div>
			{props.loading ? (
				<div className="mx-4 mb-6 gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					<SkeletonTheme height="140px" width="100%" borderRadius="lg" />
					<SkeletonTheme height="140px" width="100%" borderRadius="lg" />
					<SkeletonTheme height="140px" width="100%" borderRadius="lg" />
					<SkeletonTheme height="140px" width="100%" borderRadius="lg" />
				</div>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
					<AddFolderButton key="firefiles-add-folder-btn" currentFolder={props.currentFolder} />
					{props.folders?.length > 0 &&
						props.folders?.map((folder) => (
							<Folder
								key={folder.name}
								setIsFolderDeleting={props.setIsFolderDeleting}
								folder={folder}
							/>
						))}
					{props.files?.length > 0 &&
						props.files?.map((file) => <File key={file.name} file={file} gridView={true} />)}
				</div>
			)}
		</div>
	);
};

export default GridView;
