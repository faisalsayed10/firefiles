import { Box, Center, Divider, Text, useColorMode, Button, Grid } from "@chakra-ui/react";
import UploadFileButton from "@components/files/UploadFileButton";
import FolderBreadCrumbs from "@components/folders/FolderBreadCrumbs";
import Navbar from "@components/ui/Navbar";
import useBucket from "@hooks/useBucket";
import useKeys from "@hooks/useKeys";
import { Provider } from "@util/types";
import React, { useEffect, useMemo, useState } from "react";
import Dropzone from "react-dropzone";
import LoadingOverlay from "react-loading-overlay";
import UploadProgress from "./files/UploadProgress";
import GridView from "./GridView";
import ListView from "./ListView";
import { DriveFile } from "@util/types";

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
	const [fileSort, setFileSort] = useState("name");
	const [isAscending, setIsAscending] = useState(true);

	useEffect(() => {
		const storedView = localStorage.getItem("grid_view");
		const storedSort = localStorage.getItem("file_sort");
		const storedOrder = localStorage.getItem("is_ascending");

		if (storedView) setGridView(storedView === "true");
		if (storedSort) setFileSort(storedSort);
		if (storedOrder) setIsAscending(storedOrder === "true");
	}, []);

	useEffect(() => {
		localStorage.setItem("grid_view", gridView.toString());
	}, [gridView]);

	useEffect(() => {
		localStorage.setItem("file_sort", fileSort.toString());
	}, [fileSort]);

	useEffect(() => {
		localStorage.setItem("is_ascending", isAscending.toString());
	}, [isAscending]);

	const sortByProperty = () => {
		const sortOrder = isAscending ? 1 : -1;
		files?.sort((a: DriveFile, b: DriveFile) => {
			return a[fileSort] < b[fileSort]
				? -1 * sortOrder
				: a[fileSort] > b[fileSort]
				? 1 * sortOrder
				: 0;
		});
	};

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
							{/* Temporary buttons/elements used for logic dev */}
							<Grid
								templateColumns={[
									"repeat(auto-fill, minmax(140px, 1fr))",
									"repeat(auto-fill, minmax(160px, 1fr))",
									"repeat(auto-fill, minmax(160px, 1fr))",
								]}
								gap={[2, 6, 6]}
							>
								<Button onClick={() => setFileSort("name")}>Name</Button>
								<Button onClick={() => setFileSort("size")}>Size</Button>
								<Button onClick={() => setFileSort("createdAt")}>Created At</Button>
								<Button onClick={() => setIsAscending((prevIsAscending) => !prevIsAscending)}>
									{isAscending ? "DESC" : "ASC"}
								</Button>
							</Grid>
							{/* This is likely where the sort will be done? */}
							{files?.length > 0 && sortByProperty()}
							{!gridView ? (
								<ListView
									loading={loading}
									currentFolder={currentFolder}
									files={files}
									folders={folders}
									setGridView={setGridView}
									setIsFolderDeleting={setIsFolderDeleting}
								/>
							) : (
								<GridView
									loading={loading}
									currentFolder={currentFolder}
									files={files}
									folders={folders}
									setGridView={setGridView}
									setIsFolderDeleting={setIsFolderDeleting}
								/>
							)}
						</Box>
					)}
				</Dropzone>
				<UploadFileButton
					filesToUpload={draggedFilesToUpload}
					setFilesToUpload={setDraggedFilesToUpload}
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
