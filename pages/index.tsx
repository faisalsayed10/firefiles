import {
	Box,
	Center,
	Progress,
	SimpleGrid,
	Skeleton,
	Text,
	useColorModeValue
} from "@chakra-ui/react";
import AddFolderButton from "@components/AddFolderButton";
import FilesEmptyState from "@components/FilesEmptyState";
import FilesTable from "@components/FilesTable";
import FilesTableSkeleton from "@components/FilesTableSkeleton";
import FolderBreadCrumbs from "@components/FolderBreadCrumbs";
import FolderGrid from "@components/FolderGrid";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import UploadFileButton from "@components/UploadFileButton";
import { sessionOptions } from "@util/session";
import { CurrentlyUploading } from "@util/types";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import Dropzone from "react-dropzone";
import { useFolder } from "util/useFolder";

const getFolderId = (router: NextRouter) => {
	const pathArray = router.asPath.split("/");
	return pathArray[pathArray.length - 1];
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
	const [currentFolder, setCurrentFolder] = useState(undefined);
	const [folderId, setFolderId] = useState(getFolderId(router));
	const [draggedFilesToUpload, setDraggedFilesToUpload] = useState<File[]>([]);
	const [uploadingFiles, setUploadingFiles] = useState<CurrentlyUploading[]>([]);
	const [progress, setProgress] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const { folder, childFolders, childFiles, loading, foldersLoading } = useFolder(
		folderId,
		currentFolder
	);

	useEffect(() => {
		if (router.query?.folder) {
			setCurrentFolder(JSON.parse(router.query?.folder as string));
		}
	}, [router.query]);

	useEffect(() => {
		setFolderId(getFolderId(router));
	}, [router.asPath]);

	const style = useMemo(() => ({ ...baseStyle, ...(isDragging ? activeStyle : {}) }), [isDragging]);

	return (
		<>
			<Head>
				<title>Your Files</title>
				<meta charSet="utf-8" />
			</Head>
			<Dropzone
				onDrop={(files) => {
					setDraggedFilesToUpload(files);
					setIsDragging(false);
				}}
				noClick
				onDragOver={() => setIsDragging(true)}
				onDragLeave={() => setIsDragging(false)}
				maxFiles={1}
			>
				{({ getRootProps, getInputProps }) => (
					<Box {...getRootProps({ style })} minH="93vh">
						<input {...getInputProps()} />
						<Text
							hidden={!isDragging}
							fontSize={["2xl", "3xl", "3xl"]}
							opacity="0.9"
							color={useColorModeValue("gray.700", "gray.300")}
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
							Drop a file anywhere on the screen
						</Text>
						<Navbar />
						<Box width="100%" px="8" py="4">
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
										<FolderGrid childFolders={childFolders} currentFolder={folder} />
										<hr style={{ marginTop: "2rem", marginBottom: "2rem" }} />
									</>
								) : (
									!foldersLoading && (
										<>
											<AddFolderButton currentFolder={folder} />{" "}
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
										<FilesTable childFiles={childFiles} />
									</>
								)}
							</Box>
						</Box>
					</Box>
				)}
			</Dropzone>
			<UploadFileButton
				filesToUpload={draggedFilesToUpload}
				currentFolder={folder}
				progress={progress}
				setProgress={setProgress}
				uploadingFiles={uploadingFiles}
				setUploadingFiles={setUploadingFiles}
			/>
			<Footer />
			{uploadingFiles.length > 0 && (
				<Center>
					<Box
						borderRadius="md"
						px="4"
						pos="fixed"
						bgColor={useColorModeValue("gray.100", "gray.700")}
						bottom="5%"
						width={["90vw", "60vw", "60vw"]}
						boxShadow="3.8px 4.1px 6.3px -1.7px rgba(0, 0, 0, 0.2)"
					>
						{uploadingFiles.map((file) => (
							<Box key={"file.id"} my="4">
								<Text fontSize="md">{`Uploading ${file.name} (${progress}%)`}</Text>
								<Progress hasStripe colorScheme="blue" value={file.progress} height="5px" />
							</Box>
						))}
					</Box>
				</Center>
			)}
		</>
	);
}

export const getServerSideProps = withIronSessionSsr(async function ({ req, res }) {
	const user = req.session.user;

	if (user === undefined || !user?.email) {
		return {
			redirect: {
				permanent: false,
				destination: "/login"
			},
			props: { user }
		};
	}

	return { props: { user: req.session.user } };
}, sessionOptions);
