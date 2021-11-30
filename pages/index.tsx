import { Box, Center, Progress, Skeleton, Text } from "@chakra-ui/react";
import AddFolderButton from "@components/AddFolderButton";
import FilesEmptyState from "@components/FilesEmptyState";
import FilesTable from "@components/FilesTable";
import FilesTableSkeleton from "@components/FilesTableSkeleton";
import FolderBreadCrumbs from "@components/FolderBreadCrumbs";
import FolderGrid from "@components/FolderGrid";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { sessionOptions } from "@util/session";
import { CurrentlyUploading } from "@util/types";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useFolder } from "util/useFolder";

const getFolderId = (router: NextRouter) => {
	const pathArray = router.asPath.split("/");
	return pathArray[pathArray.length - 1];
};

export default function Index() {
	const router = useRouter();
	const [currentFolder, setCurrentFolder] = useState(undefined);
	const [folderId, setFolderId] = useState(getFolderId(router));
	const { folder, childFolders, childFiles, loading, foldersLoading } = useFolder(
		folderId,
		currentFolder
	);

	const [uploadingFiles, setUploadingFiles] = useState<CurrentlyUploading[]>([]);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (router.query?.folder) {
			setCurrentFolder(JSON.parse(router.query?.folder as string));
		}
	}, [router.query]);

	useEffect(() => {
		setFolderId(getFolderId(router));
	}, [router.asPath]);

	return (
		<>
			<Head>
				<title>Your Files</title>
				<meta charSet="utf-8" />
			</Head>
			<Navbar />
			<Box width="100%" px="8" py="4">
				{/* BREADCRUMBS */}

				<FolderBreadCrumbs currentFolder={folder} />
				<hr style={{ marginBottom: "2rem" }} />
				<Box>
					{/* FOLDERS */}

					{foldersLoading && (
						<>
							<Skeleton h="140px" w="100%" />
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

					{/* FILES */}

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
			<Footer />
			{/* PROGRESS BAR */}
			{uploadingFiles.length > 0 && (
				<Center>
					<Box
						borderWidth="2px"
						borderRadius="md"
						px="4"
						pos="fixed"
						bgColor="#3182ce"
						bottom="5%"
						width="80vw"
					>
						{uploadingFiles
							.filter((file) => !file.error)
							.map((file) => (
								<Box key={file.id} my="4">
									<Text fontSize="md">
										{file.error ? "Upload Failed!" : `Uploading ${file.name} (${progress}%)`}
									</Text>
									<Progress
										isIndeterminate={!file.error}
										colorScheme={file.error ? "red" : "blue"}
										value={100}
										height="5px"
									/>
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
