import { SimpleGrid, Box } from "@chakra-ui/react";
import { FolderCollection } from "@util/types";
import React from "react";
import AddFolderButton from "./AddFolderButton";
import Folder from "./Folder";

interface Props {
	childFolders?: FolderCollection[];
	currentFolder: FolderCollection;
}

const FolderGrid: React.FC<Props> = ({ childFolders, currentFolder }) => {
	return (
		<SimpleGrid columns={[2, 4, 6, 6, 7]} spacing="10px">
			{childFolders?.map((childFolder) => (
				<Box m="0 auto" key={childFolder.id}>
					<Folder folder={childFolder} />
				</Box>
			))}
			<Box m="0 auto">
				<AddFolderButton currentFolder={currentFolder} />
			</Box>
		</SimpleGrid>
	);
};

export default FolderGrid;
