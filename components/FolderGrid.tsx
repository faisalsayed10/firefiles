import { SimpleGrid } from "@chakra-ui/react";
import { FolderCollection } from "@util/types";
import React from "react";
import Folder from "./Folder";

interface Props {
  childFolders: FolderCollection[];
}

const FolderGrid: React.FC<Props> = ({ childFolders }) => {
  return (
    <SimpleGrid minChildWidth="140px" spacing="40px">
      {childFolders.map((childFolder) => (
        <Folder key={childFolder.id} folder={childFolder} />
      ))}
    </SimpleGrid>
  );
}

export default FolderGrid;
