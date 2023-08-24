import { Divider, Flex, Grid, IconButton, Skeleton, Text, Box } from "@chakra-ui/react";
import FilesEmptyState from "@components/files/FilesEmptyState";
import FilesTable from "@components/files/FilesTable";
import FilesTableSkeleton from "@components/files/FilesTableSkeleton";
import AddFolderButton from "@components/folders/AddFolderButton";
import Folder from "@components/folders/Folder";
import { DriveFile, DriveFolder, FileSortConfig, TagFilter } from "@util/types";
import React, { useContext, useState } from "react";
import { LayoutGrid, Filter } from "tabler-icons-react";
import FileSortMenu from "@components/ui/FileSortMenu";
import FilterTags from "./popups/FilterTags";
import { RoleContext } from "pages/drives/[id]";
import { Role } from "@prisma/client";
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

const ListView: React.FC<Props> = (props) => {
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
    <>
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
          my="6"
          mx="4"
        >
          {props.folders?.map((f) => (
            <Folder key={f.name} setIsFolderDeleting={props.setIsFolderDeleting} folder={f} />
          ))}
          {role === Role.VIEWER || <AddFolderButton currentFolder={props.currentFolder} />}
        </Grid>
      )}
      <Divider />
      <Flex align="center" justify="space-between" m="4">
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
          <IconButton aria-label="change-view" onClick={() => props.setGridView(true)}>
            <LayoutGrid />
          </IconButton>
        </Box>
      </Flex>
      {props.files === null && props.loading ? (
        <FilesTableSkeleton />
      ) : !props.files || props.files?.length === 0 ? (
        <FilesEmptyState />
      ) : (
        <FilesTable files={props.files} />
      )}
      <FilterTags
        isOpen={isFilterTagsOpen}
        onClose={closeFilterTags}
        fileTagFilter={props.fileTagFilter}
        setFileTagFilter={props.setFileTagFilter}
      />
    </>
  );
};

export default ListView;
