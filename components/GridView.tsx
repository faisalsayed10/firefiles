import { Box, Flex, Grid, IconButton, Skeleton, Text } from "@chakra-ui/react";
import Folder from "@components/folders/Folder";
import { BucketFile, BucketFolder } from "@util/types";
import React from "react";
import { LayoutList } from "tabler-icons-react";
import File from "./files/File";
import AddFolderButton from "./folders/AddFolderButton";

type Props = {
	setGridView: React.Dispatch<React.SetStateAction<boolean>>;
	loading: boolean;
	currentFolder: BucketFolder;
	folders: BucketFolder[];
	files: BucketFile[];
	setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
};

const GridView: React.FC<Props> = (props) => {
	return (
		<Box mx="4">
			<Flex align="center" justify="space-between" my="4">
				<Text fontSize="3xl" fontWeight="600">
					Your Files
				</Text>
				<IconButton aria-label="change-view" onClick={() => props.setGridView(false)}>
					<LayoutList />
				</IconButton>
			</Flex>
			{props.loading ? (
				<Grid
					templateColumns={[
						"repeat(2, 1fr)",
						"repeat(3, 1fr)",
						"repeat(4, 1fr)",
						"repeat(6, 1fr)",
						"repeat(7, 1fr)",
						"repeat(8, 1fr)",
					]}
					gap={6}
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
						"repeat(2, 1fr)",
						"repeat(3, 1fr)",
						"repeat(4, 1fr)",
						"repeat(6, 1fr)",
						"repeat(7, 1fr)",
						"repeat(8, 1fr)",
					]}
					gap={6}
				>
					{props.folders?.length > 0 &&
						props.folders?.map((folder) => (
							<Folder
								key={folder.name}
								setIsFolderDeleting={props.setIsFolderDeleting}
								folder={folder}
							/>
						))}
					<AddFolderButton key="firefiles-add-folder-btn" currentFolder={props.currentFolder} />
					{props.files?.length > 0 &&
						props.files?.map((file) => <File key={file.name} file={file} gridView={true} />)}
				</Grid>
			)}
		</Box>
	);
};

export default GridView;