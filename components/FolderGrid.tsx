import { Box, SimpleGrid } from "@chakra-ui/react";
import { StorageReference } from "@firebase/storage";
import { ReducerAction } from "@util/useFolder";
import React from "react";
import AddFolderButton from "./AddFolderButton";
import Folder from "./Folder";

interface Props {
	dispatch: React.Dispatch<ReducerAction>;
	childFolders?: StorageReference[];
	currentFolder: StorageReference;
	setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
}

const FolderGrid: React.FC<Props> = ({
	childFolders,
	currentFolder,
	dispatch,
	setIsFolderDeleting
}) => {
	return (
		<SimpleGrid columns={[2, 4, 6, 6, 7]} spacing="10px">
			{childFolders?.map((childFolder) => (
				<Box m="0 auto" key={childFolder.name}>
					<Folder
						setIsFolderDeleting={setIsFolderDeleting}
						folder={childFolder}
						childFolders={childFolders}
						dispatch={dispatch}
					/>
				</Box>
			))}
			<Box m="0 auto">
				<AddFolderButton currentFolder={currentFolder} dispatch={dispatch} />
			</Box>
		</SimpleGrid>
	);
};

export default FolderGrid;
