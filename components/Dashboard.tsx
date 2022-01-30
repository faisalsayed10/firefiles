import { Box, Divider, Grid, Skeleton, Text, useColorMode } from "@chakra-ui/react";
import AddFolderButton from "@components/AddFolderButton";
import FilesEmptyState from "@components/FilesEmptyState";
import FilesTable from "@components/FilesTable";
import FilesTableSkeleton from "@components/FilesTableSkeleton";
import Folder from "@components/Folder";
import FolderBreadCrumbs from "@components/FolderBreadCrumbs";
import Navbar from "@components/Navbar";
import UploadFileButton from "@components/UploadFileButton";
import UploadProgress from "@components/UploadProgress";
import useFirebase from "@hooks/useFirebase";
import { CurrentlyUploading } from "@util/types";
import React, { useMemo, useState } from "react";
import Dropzone from "react-dropzone";
import LoadingOverlay from "react-loading-overlay";

const baseStyle = {
	outline: "none",
	transition: "border .2s ease-in-out"
};

const activeStyle = {
	borderWidth: 2,
	borderRadius: 2,
	borderStyle: "dashed",
	borderColor: "#2196f3",
	backgroundColor: "rgba(0, 0, 0, 0.25)"
};

const Dashboard = () => {
	const [draggedFilesToUpload, setDraggedFilesToUpload] = useState<File[]>([]);
	const [uploadingFiles, setUploadingFiles] = useState<CurrentlyUploading[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isFolderDeleting, setIsFolderDeleting] = useState(false);
	const { app, appUser, currentFolder, files, folders, loading } = useFirebase();
	const { colorMode } = useColorMode();
	const style = useMemo(() => ({ ...baseStyle, ...(isDragging ? activeStyle : {}) }), [isDragging]);

	return (
		<>
			<LoadingOverlay
				active={isFolderDeleting}
				spinner={true}
				text={`Deleting Files... \nPlease DO NOT close this tab.`}
			>
				<Dropzone
					onDrop={(files) => {
						setDraggedFilesToUpload(files);
						setIsDragging(false);
					}}
					disabled={!app || !appUser}
					noClick
					onDragOver={() => setIsDragging(true)}
					onDragLeave={() => setIsDragging(false)}
				>
					{({ getRootProps, getInputProps }) => (
						<Box {...getRootProps({ style })} minH="93vh">
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
							<FolderBreadCrumbs currentFolder={currentFolder} />
							<Divider />
							{loading ? (
								<Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={6} my="6" mx="4">
									<Skeleton h="110px" w="110px" borderRadius="3px" />
									<Skeleton h="110px" w="110px" borderRadius="3px" />
									<Skeleton h="110px" w="110px" borderRadius="3px" />
									<Skeleton h="110px" w="110px" borderRadius="3px" />
								</Grid>
							) : (
								<Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={6} my="6" mx="4">
									{folders?.map((f) => (
										<Box m="0 auto" key={f.name}>
											<Folder setIsFolderDeleting={setIsFolderDeleting} folder={f} />
										</Box>
									))}
									<Box m="0 auto">
										<AddFolderButton currentFolder={currentFolder} />
									</Box>
								</Grid>
							)}
							<Divider />
							<Text fontSize="3xl" fontWeight="600" m="4">
								Your Files
							</Text>
							{files === null || loading ? (
								<FilesTableSkeleton />
							) : files.length === 0 ? (
								<FilesEmptyState />
							) : (
								<FilesTable childFiles={files} />
							)}
						</Box>
					)}
				</Dropzone>
				<UploadFileButton
					filesToUpload={draggedFilesToUpload}
					setFilesToUpload={setDraggedFilesToUpload}
					currentFolder={currentFolder}
					uploadingFiles={uploadingFiles}
					setUploadingFiles={setUploadingFiles}
				/>
			</LoadingOverlay>
			{uploadingFiles.length > 0 && <UploadProgress uploadingFiles={uploadingFiles} />}
		</>
	);
};

export default Dashboard;
