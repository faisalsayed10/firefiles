import {
	Box,
	Button,
	Center,
	Menu,
	MenuButton,
	MenuDivider,
	MenuList,
	Progress,
	Skeleton,
	Text,
	useMediaQuery
} from "@chakra-ui/react";
import AddFileButton from "@components/AddFileButton";
import AddFolderButton from "@components/AddFolderButton";
import FilesEmptyState from "@components/FilesEmptyState";
import FilesTable from "@components/FilesTable";
import FilesTableSkeleton from "@components/FilesTableSkeleton";
import FolderBreadCrumbs from "@components/FolderBreadCrumbs";
import FolderGrid from "@components/FolderGrid";
import Footer from "@components/Footer";
import HomeButton from "@components/HomeButton";
import Navbar from "@components/Navbar";
import ProfileButton from "@components/ProfileButton";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sessionOptions } from "@util/session";
import { CurrentlyUploading } from "@util/types";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useFolder } from "util/useFolder";

export default function Index() {
	const router = useRouter();
	const { folder, childFolders, childFiles, loading, foldersLoading } = useFolder(
		router.asPath.substring(1),
		undefined // TODO:
	);
	const [uploadingFiles, setUploadingFiles] = useState<CurrentlyUploading[]>([]);
	const [progress, setProgress] = useState(0);
	const [isSmallerThan700] = useMediaQuery("(max-width: 700px)");

	return (
		<>
			<Head>
				<title>Your Files</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<Navbar />
			<Box width="100%" px="8" py="4">
				{/* TOP BUTTONS */}
				{isSmallerThan700 ? (
					<Menu isLazy placement="bottom">
						<MenuButton
							variant="outline"
							colorScheme="cyan"
							width="100%"
							as={Button}
							rightIcon={<FontAwesomeIcon icon={faChevronDown} />}>
							Menu
						</MenuButton>
						<MenuList w="inherit">
							<HomeButton variant="ghost" />
							<MenuDivider />
							<AddFileButton
								currentFolder={folder}
								setProgress={setProgress}
								progress={progress}
								variant="ghost"
								setUploadingFiles={setUploadingFiles}
								btnWidth="100%"
							/>
							<MenuDivider />
							<AddFolderButton variant="ghost" btnWidth="100%" currentFolder={folder} />
							<MenuDivider />
							<ProfileButton variant="ghost" />
						</MenuList>
					</Menu>
				) : (
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-around"
						fontSize="xl"
						flexWrap="wrap">
						<HomeButton variant="outline" />
						<AddFileButton
							currentFolder={folder}
							setProgress={setProgress}
							progress={progress}
							setUploadingFiles={setUploadingFiles}
							variant="outline"
						/>
						<AddFolderButton currentFolder={folder} variant="outline" />
						<ProfileButton variant="outline" />
					</Box>
				)}

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

					{childFolders?.length > 0 && (
						<>
							<FolderGrid childFolders={childFolders} />
							<hr style={{ marginTop: "2rem", marginBottom: "2rem" }} />
						</>
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
						width="80vw">
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
