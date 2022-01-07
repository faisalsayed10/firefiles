import { Box, SimpleGrid } from "@chakra-ui/react";
import { StorageReference } from "@firebase/storage";
import { ReducerAction } from "hooks/useFolder";
import React from "react";
import AddFolderButton from "./AddFolderButton";
import Folder from "./Folder";

interface Props {
	dispatch: React.Dispatch<ReducerAction>;
	childFolders?: StorageReference[];
	currentFolder: StorageReference;
	setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
}

const FolderGrid: React.FC<Props> = ({ childFolders, currentFolder, setIsFolderDeleting, dispatch }) => {
	return (
		<SimpleGrid columns={[2, 4, 6, 6, 7]} spacing="10px">
			{childFolders?.map((childFolder) => (
				<Box m="0 auto" key={childFolder.name}>
					<Folder
						dispatch={dispatch}
						setIsFolderDeleting={setIsFolderDeleting}
						folder={childFolder}
						childFolders={childFolders}
					/>
				</Box>
			))}
			<Box m="0 auto">
				<AddFolderButton dispatch={dispatch} currentFolder={currentFolder} />
			</Box>
		</SimpleGrid>
	);
};

export default FolderGrid;
