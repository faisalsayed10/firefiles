import { Box, Flex, Grid, IconButton, Skeleton, Text } from "@chakra-ui/react";
import Folder from "@components/folders/Folder";
import { DriveFile, DriveFolder, TagFilter } from "@util/types";
import React, { useContext, useState } from "react";
import { LayoutList, Filter } from "tabler-icons-react";
import { FileSortConfig } from "@util/types";
import File from "./files/File";
import AddFolderButton from "./folders/AddFolderButton";
import FileSortMenu from "./ui/FileSortMenu";
import { RoleContext } from "pages/drives/[id]";
import { Role } from "@prisma/client";
import FilterTags from "./popups/FilterTags";
import useBucket from "@hooks/useBucket";

type Props = {
  setGridView: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  currentFolder: DriveFolder;
  folders: DriveFolder[];
  files: DriveFile[];
  setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
  setFileSort: React.Dispatch<React.SetStateAction<FileSortConfig>>;
  fileSort: FileSortConfig;
  fileTagFilter: TagFilter;
  setFileTagFilter: React.Dispatch<React.SetStateAction<TagFilter>>;
};

const GridView: React.FC<Props> = (props) => {
  const role = useContext(RoleContext);
  const [isFilterTagsOpen, setIsFilterTagsOpen] = useState(false);
  const { enableTags } = useBucket();

  const openFilterTags = () => {
    setIsFilterTagsOpen(true);
  };

  const closeFilterTags = () => {
    setIsFilterTagsOpen(false);
  };

  return (
    <Box mx="4" mb="6">
      <Flex align="center" justify="space-between" my="4">
        <Text fontSize="3xl" fontWeight="600">
          Your Files
        </Text>
        <Box>
          <FileSortMenu setFileSort={props.setFileSort} fileSort={props.fileSort} />
          {enableTags ? (
            <IconButton aria-label="filter-tags" mr={1} onClick={openFilterTags}>
              <Filter />
            </IconButton>
          ) : null}
          <IconButton aria-label="change-view" onClick={() => props.setGridView(false)}>
            <LayoutList />
          </IconButton>
        </Box>
      </Flex>
      {props.loading ? (
        <Grid
          templateColumns={[
            "repeat(auto-fill, minmax(140px, 1fr))",
            "repeat(auto-fill, minmax(160px, 1fr))",
            "repeat(auto-fill, minmax(160px, 1fr))",
          ]}
          gap={[2, 6, 6]}
          my="6"
          mx="4"
        >
          <Skeleton h="140px" w="full" borderRadius="lg" />
          <Skeleton h="140px" w="full" borderRadius="lg" />
          <Skeleton h="140px" w="full" borderRadius="lg" />
          <Skeleton h="140px" w="full" borderRadius="lg" />
        </Grid>
      ) : (
        <Grid
          templateColumns={[
            "repeat(auto-fill, minmax(140px, 1fr))",
            "repeat(auto-fill, minmax(160px, 1fr))",
            "repeat(auto-fill, minmax(160px, 1fr))",
          ]}
          gap={[2, 6, 6]}
        >
          {role === Role.VIEWER || (
            <AddFolderButton key="firefiles-add-folder-btn" currentFolder={props.currentFolder} />
          )}
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
        </Grid>
      )}
      <FilterTags
        isOpen={isFilterTagsOpen}
        onClose={closeFilterTags}
        fileTagFilter={props.fileTagFilter}
        setFileTagFilter={props.setFileTagFilter}
      />
    </Box>
  );
};

export default GridView;
