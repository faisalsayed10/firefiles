import { Box, Center, Progress, SimpleGrid, Skeleton, Text, useColorMode } from "@chakra-ui/react";
import AddFolderButton from "@components/AddFolderButton";
import FilesEmptyState from "@components/FilesEmptyState";
import FilesTable from "@components/FilesTable";
import FilesTableSkeleton from "@components/FilesTableSkeleton";
import FolderBreadCrumbs from "@components/FolderBreadCrumbs";
import FolderGrid from "@components/FolderGrid";
import Navbar from "@components/Navbar";
import UploadFileButton from "@components/UploadFileButton";
import useFolder from "@hooks/useFolder";
import useUser from "@hooks/useUser";
import { CurrentlyUploading } from "@util/types";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import Dropzone from "react-dropzone";
import LoadingOverlay from "react-loading-overlay";

const getFolderPath = (router: NextRouter) => {
	const pathArray = router.asPath.split("/");
	return pathArray.slice(2).join("/");
};

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

export default function Index() {
	const router = useRouter();
	const [folderPath, setFolderPath] = useState(getFolderPath(router));
	const [draggedFilesToUpload, setDraggedFilesToUpload] = useState<File[]>([]);
	const [uploadingFiles, setUploadingFiles] = useState<CurrentlyUploading[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isFolderDeleting, setIsFolderDeleting] = useState(false);
	const { currentUser } = useUser();
	const { colorMode } = useColorMode();
	const style = useMemo(() => ({ ...baseStyle, ...(isDragging ? activeStyle : {}) }), [isDragging]);
	const { folder, childFolders, childFiles, loading, foldersLoading, dispatch } = useFolder(
		decodeURIComponent(folderPath)
	);

	useEffect(() => {
		setFolderPath(getFolderPath(router));
	}, [router.asPath]);

	useEffect(() => {
		if (!currentUser) {
			router.push("/login");
		}
	}, [currentUser]);

	return (
		<>
			<Head>
				<title>firefiles — Your Files</title>
				<meta charSet="utf-8" />
			</Head>
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
								textTransform="uppercase"
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
								Drop files anywhere on the screen
							</Text>
							<Navbar />
							<Box width="100%" px={["4", "6", "8"]} py="4">
								<FolderBreadCrumbs currentFolder={folder} />
								<hr style={{ marginBottom: "2rem" }} />
								<Box>
									{foldersLoading && (
										<>
											<SimpleGrid columns={[2, 4, 6]} spacing="10px">
												<Skeleton h="110px" w="110px" borderRadius="3px" />
												<Skeleton h="110px" w="110px" borderRadius="3px" />
												<Skeleton h="110px" w="110px" borderRadius="3px" />
												<Skeleton h="110px" w="110px" borderRadius="3px" />
											</SimpleGrid>
											<hr style={{ marginTop: "2rem", marginBottom: "2rem" }} />
										</>
									)}
									{childFolders?.length > 0 ? (
										<>
											<FolderGrid
												dispatch={dispatch}
												childFolders={childFolders}
												currentFolder={folder}
												setIsFolderDeleting={setIsFolderDeleting}
											/>
											<hr style={{ marginTop: "2rem", marginBottom: "2rem" }} />
										</>
									) : (
										!foldersLoading && (
											<>
												<AddFolderButton dispatch={dispatch} currentFolder={folder} />
												<hr style={{ marginTop: "2rem", marginBottom: "2rem" }} />
											</>
										)
									)}
									{loading && (
										<>
											<Text fontSize="3xl" fontWeight="600" mb={4}>
												Your Files
											</Text>
											<FilesTableSkeleton />
										</>
									)}
									{!loading && childFiles?.length === 0 && (
										<>
											<Text fontSize="3xl" fontWeight="600" mb={4}>
												Your Files
											</Text>
											<FilesEmptyState />
										</>
									)}
									{childFiles?.length > 0 && (
										<>
											<Text fontSize="3xl" fontWeight="600" mb={4}>
												Your Files
											</Text>
											<FilesTable dispatch={dispatch} childFiles={childFiles} />
										</>
									)}
								</Box>
							</Box>
						</Box>
					)}
				</Dropzone>
				<UploadFileButton
					dispatch={dispatch}
					filesToUpload={draggedFilesToUpload}
					setFilesToUpload={setDraggedFilesToUpload}
					currentFolder={folder}
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
							<Box key={file.id} my="4">
								<Text fontSize="md">{`Uploading ${file.name} (${file.progress}%)`}</Text>
								<Progress hasStripe value={file.progress} height="5px" />
							</Box>
						))}
					</Box>
				</Center>
			)}
		</>
	);
}
