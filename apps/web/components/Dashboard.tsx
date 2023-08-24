
import {
  Box,
  Center,
  Divider,
  Text,
  useColorMode,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { Flex } from '@chakra-ui/react';
import UploadFileButton from "@components/files/UploadFileButton";
import SyncButton from "@components/files/SyncButton";
import FolderBreadCrumbs from "@components/folders/FolderBreadCrumbs";
import Navbar from "@components/ui/Navbar";
import useBucket from "@hooks/useBucket";
import useKeys from "@hooks/useKeys";
import { DriveFile, FileSortConfig, TagFilter } from "@util/types";
import React, { useContext, useEffect, useMemo, useState } from "react";
import Dropzone from "react-dropzone";
import LoadingOverlay from "react-loading-overlay";
import UploadProgress from "./files/UploadProgress";
import GridView from "./GridView";
import ListView from "./ListView";
import { sortDriveFiles } from "@util/file-sorting";
import { Refresh } from "tabler-icons-react";
import { RoleContext } from "pages/drives/[id]";
import { Role } from "@prisma/client";
import toast from "react-hot-toast";

const baseStyle = {
  outline: "none",
  transition: "border .2s ease-in-out",
};

const activeStyle = {
  borderWidth: 2,
  borderRadius: 2,
  borderStyle: "dashed",
  borderColor: "#2196f3",
  backgroundColor: "rgba(0, 0, 0, 0.25)",
};

const Dashboard = () => {
  const [draggedFilesToUpload, setDraggedFilesToUpload] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isFolderDeleting, setIsFolderDeleting] = useState(false);
  const { currentFolder, files, folders, loading, uploadingFiles } = useBucket();
  const { colorMode } = useColorMode();
  const style = useMemo(() => ({ ...baseStyle, ...(isDragging ? activeStyle : {}) }), [isDragging]);
  const [gridView, setGridView] = useState(false);
  const [fileSort, setFileSort] = useState<FileSortConfig>({ property: "name", isAscending: true });
  const [sortedFiles, setSortedFiles] = useState<DriveFile[]>([]);
  const [fileTagFilter, setFileTagFilter] = useState<TagFilter>({});
  const { listTags } = useBucket();
  const role = useContext(RoleContext);
  const { keys: drive } = useKeys();

  // filter files by tag
  const filterDriveFiles = async (files: DriveFile[]): Promise<DriveFile[]> => {
    // map each file to a boolean array
    const mapFilter = await Promise.all(files.map(file => filterByTag(file, fileTagFilter)));
    // filter files by the boolean array
    return files.filter((file, index) => mapFilter[index]);
  }
  // return a boolean based on if file matches the tag filter
  const filterByTag = async (file: DriveFile, fileTagFilter): Promise<boolean> => {
    const tags = await listTags(file);
    if (tags) {
      // filter based on whether key, value, or both is provided
      if (fileTagFilter.hasOwnProperty("key") && fileTagFilter.hasOwnProperty("value")) {
        return tags.some(tag => (tag.key === fileTagFilter.key) && (tag.value === fileTagFilter.value));
      } else if (fileTagFilter.hasOwnProperty("key")) {
        return tags.some(tag => (tag.key === fileTagFilter.key))
      } else if (fileTagFilter.hasOwnProperty("value")) {
        return tags.some(tag => (tag.value === fileTagFilter.value))
      }
    }
    return false;
  }

  useEffect(() => {
    const storedView = localStorage.getItem("grid_view");
    const storedFileSort = localStorage.getItem("file_sort");

    if (storedView) setGridView(storedView === "true");
    if (storedFileSort) setFileSort(JSON.parse(storedFileSort));
  }, []);

  useEffect(() => {
    localStorage.setItem("grid_view", gridView.toString());
  }, [gridView]);

  useEffect(() => {
    localStorage.setItem("file_sort", JSON.stringify(fileSort));
  }, [fileSort]);

  useEffect(() => {
    if (!files) {
      setSortedFiles([]);
      return;
    }
    // filter files if user has selected filter
    if (fileTagFilter.hasOwnProperty("key") || fileTagFilter.hasOwnProperty("value")) {
      const fetchFilteredFiles = async () => {
        const filteredFiles = await filterDriveFiles(files);
        // sort filtered files
        const sortedFilteredFiles = sortDriveFiles(filteredFiles, fileSort);
        setSortedFiles(sortedFilteredFiles);
      }
      fetchFilteredFiles().catch(() => { toast.error(`Unable to fetch filtered files.`) });
    } else {
      const sortedFiles = sortDriveFiles(files, fileSort);
      setSortedFiles(sortedFiles);
    }
  }, [fileSort, files, fileTagFilter]);

  return (
    <>
      <LoadingOverlay
        active={isFolderDeleting}
        spinner={true}
        text={`Deleting Files... \nPlease DO NOT close this tab.`}
      >
        <Dropzone
          disabled={role === Role.VIEWER}
          onDrop={(files) => {
            setDraggedFilesToUpload(files);
            setIsDragging(false);
          }}
          noClick
          onDragOver={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          {({ getRootProps, getInputProps }) => (
            <Box
              {...getRootProps({
                style,
              })}
              minH="93vh"
            >
              <input {...getInputProps()} />
              <Text
                hidden={!isDragging}
                fontSize={["2xl", "3xl", "3xl"]}
                opacity="0.9"
                color={colorMode === "light" ? "gray.700" : "gray.300"}
                fontWeight="700"
                align="center"
                pos="absolute"
                top="50%"
                left="50%"
                w="full"
                transform="translate(-50%, -50%)"
                p="0"
                px="2"
                m="0"
              >
                DROP FILES ANYWHERE ON THE SCREEN
              </Text>
              <Navbar />
              <Flex justifyContent="space-between" alignItems="center">
                <FolderBreadCrumbs currentFolder={currentFolder} />
                <Text fontWeight="bold" whiteSpace="nowrap" marginRight="9" textAlign="right">
                  {`${drive.name} - ${role}`}
                </Text>
              </Flex>
              <Divider />
              {!gridView ? (
                <ListView
                  loading={loading}
                  currentFolder={currentFolder}
                  files={sortedFiles}
                  folders={folders}
                  setGridView={setGridView}
                  setIsFolderDeleting={setIsFolderDeleting}
                  setFileSort={setFileSort}
                  fileSort={fileSort}
                  fileTagFilter={fileTagFilter}
                  setFileTagFilter={setFileTagFilter}
                />
              ) : (
                <GridView
                  loading={loading}
                  currentFolder={currentFolder}
                  files={sortedFiles}
                  folders={folders}
                  setGridView={setGridView}
                  setIsFolderDeleting={setIsFolderDeleting}
                  setFileSort={setFileSort}
                  fileSort={fileSort}
                  fileTagFilter={fileTagFilter}
                  setFileTagFilter={setFileTagFilter}
                />
              )}
            </Box>
          )}
        </Dropzone>
        {role === Role.VIEWER ? (
          ""
        ) : (
          <UploadFileButton
            filesToUpload={draggedFilesToUpload}
            setFilesToUpload={setDraggedFilesToUpload}
          />
        )}
        <SyncButton />
      </LoadingOverlay>
      {uploadingFiles.length > 0 && (
        <Center>
          <Box
            borderRadius="sm"
            px="4"
            pos="fixed"
            bottom="5%"
            width={["90vw", "60vw", "60vw"]}
            boxShadow="3.8px 4.1px 6.3px -1.7px rgba(0, 0, 0, 0.2)"
            backgroundColor={colorMode === "dark" ? "gray.700" : "white"}
          >
            {uploadingFiles.map((uploading) => (
              <UploadProgress key={uploading.id} file={uploading} />
            ))}
          </Box>
        </Center>
      )}
    </>
  );
};

export default Dashboard;
