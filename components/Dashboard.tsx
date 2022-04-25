import {
	Box,
	Button,
	Center,
	Divider,
	Flex,
	Grid,
	Skeleton,
	Spacer,
	Text,
	useColorMode,
} from "@chakra-ui/react";
import FilesEmptyState from "@components/files/FilesEmptyState";
import FilesTable from "@components/files/FilesTable";
import FilesTableSkeleton from "@components/files/FilesTableSkeleton";
import UploadFileButton from "@components/files/UploadFileButton";
import AddFolderButton from "@components/folders/AddFolderButton";
import Folder from "@components/folders/Folder";
import FolderBreadCrumbs from "@components/folders/FolderBreadCrumbs";
import Navbar from "@components/ui/Navbar";
import { faGripHorizontal, faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useFirebase from "@hooks/useFirebase";
import { CurrentlyUploading } from "@util/types";
import React, { useMemo, useState } from "react";
import Dropzone from "react-dropzone";
import LoadingOverlay from "react-loading-overlay";
import UploadProgress from "./files/UploadProgress";

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
	const [uploadingFiles, setUploadingFiles] = useState<CurrentlyUploading[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isFolderDeleting, setIsFolderDeleting] = useState(false);
	const { app, appUser, currentFolder, files, folders, loading } = useFirebase();
	const { colorMode } = useColorMode();
	const style = useMemo(() => ({ ...baseStyle, ...(isDragging ? activeStyle : {}) }), [isDragging]);
	const [gridOn, setGridOn] = useState(false);

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
							<FolderBreadCrumbs currentFolder={currentFolder} />
							<Divider />
							{!gridOn && (
								<>
									{" "}
									{loading ? (
										<Grid
											templateColumns="repeat(auto-fill, minmax(120px, 1fr))"
											gap={6}
											my="6"
											mx="4"
										>
											<Skeleton h="110px" w="110px" borderRadius="3px" />
											<Skeleton h="110px" w="110px" borderRadius="3px" />
											<Skeleton h="110px" w="110px" borderRadius="3px" />
											<Skeleton h="110px" w="110px" borderRadius="3px" />
										</Grid>
									) : (
										<Grid
											templateColumns="repeat(auto-fill, minmax(120px, 1fr))"
											gap={6}
											my="6"
											mx="4"
										>
											{folders?.map((f) => (
												<Box w="110px" h="110px" m="0 auto" key={f.name}>
													<Folder setIsFolderDeleting={setIsFolderDeleting} folder={f} />
												</Box>
											))}
											<Box m="0 auto">
												<AddFolderButton currentFolder={currentFolder} />
											</Box>
										</Grid>
									)}{" "}
								</>
							)}
							<Divider />
							<Flex width="100%" align="center">
								<Box>
									<Text fontSize="3xl" fontWeight="600" m="4">
										Your Files
									</Text>
								</Box>
								<Spacer />
								<Box m="4">
									<Button onClick={() => setGridOn(!gridOn)}>
										{gridOn ? (
											<>
												<FontAwesomeIcon
													style={{
														marginRight: "6px",
													}}
													icon={faList}
												/>
												{` `}
												List View
											</>
										) : (
											<>
												<FontAwesomeIcon
													style={{
														marginRight: "6px",
													}}
													icon={faGripHorizontal}
												/>
												{` `}
												Grid View
											</>
										)}
									</Button>
								</Box>
							</Flex>
							{files === null || loading ? (
								<FilesTableSkeleton />
							) : files.length === 0 && !gridOn ? (
								<FilesEmptyState />
							) : (
								<FilesTable childFolders={folders} childFiles={files} gridOn={gridOn} />
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
						{uploadingFiles.map((file) => (
							<UploadProgress key={file.id} file={file} setUploadingFiles={setUploadingFiles} />
						))}
					</Box>
				</Center>
			)}
		</>
	);
};

export default Dashboard;
