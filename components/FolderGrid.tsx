import { SimpleGrid } from "@chakra-ui/react";
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
		<SimpleGrid columns={[2, 4, 6]} spacing="40px">
			{childFolders?.map((childFolder) => (
				<Folder key={childFolder.id} folder={childFolder} />
			))}
			<AddFolderButton currentFolder={currentFolder} />
		</SimpleGrid>
	);
};

export default FolderGrid;
