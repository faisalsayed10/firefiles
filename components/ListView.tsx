import { Divider, Flex, Grid, IconButton, Skeleton, Text } from "@chakra-ui/react";
import FilesEmptyState from "@components/files/FilesEmptyState";
import FilesTable from "@components/files/FilesTable";
import FilesTableSkeleton from "@components/files/FilesTableSkeleton";
import AddFolderButton from "@components/folders/AddFolderButton";
import Folder from "@components/folders/Folder";
import { BucketFile, BucketFolder } from "@util/types";
import React from "react";
import { LayoutGrid } from "tabler-icons-react";

type Props = {
	setGridView: React.Dispatch<React.SetStateAction<boolean>>;
	loading: boolean;
	currentFolder: BucketFolder;
	folders: BucketFolder[];
	files: BucketFile[];
	setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
};

const ListView: React.FC<Props> = (props) => {
	return (
		<>
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
					my="6"
					mx="4"
				>
					{props.folders?.map((f) => (
						<Folder key={f.name} setIsFolderDeleting={props.setIsFolderDeleting} folder={f} />
					))}
					<AddFolderButton currentFolder={props.currentFolder} />
				</Grid>
			)}
			<Divider />
			<Flex align="center" justify="space-between" m="4">
				<Text fontSize="3xl" fontWeight="600">
					Your Files
				</Text>
				<IconButton aria-label="change-view" onClick={() => props.setGridView(true)}>
					<LayoutGrid />
				</IconButton>
			</Flex>
			{props.files === null || props.loading ? (
				<FilesTableSkeleton />
			) : props.files.length === 0 ? (
				<FilesEmptyState />
			) : (
				<FilesTable files={props.files} />
			)}
		</>
	);
};

export default ListView;
