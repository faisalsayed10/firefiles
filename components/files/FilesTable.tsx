import { Box, Table, Th, Tr } from "@chakra-ui/react";
import { StorageReference } from "firebase/storage";
import React from "react";
import File from "./File";

interface Props {
	childFiles: StorageReference[];
}

const FilesTable: React.FC<Props> = ({ childFiles }) => {
	return (
		<Box borderWidth="1px" borderRadius="lg" overflowX="auto" mx="4" mb="4">
			<Table w="full">
				<thead>
					<Tr>
						<Th></Th>
						<Th>Name</Th>
						<Th>Size</Th>
						<Th textAlign="center">Share</Th>
						<Th textAlign="center">Download</Th>
						<Th textAlign="center">Delete</Th>
					</Tr>
				</thead>
				<tbody>
					{childFiles.length > 0 &&
						childFiles.map((childFile) => <File key={childFile.name} file={childFile} />)}
				</tbody>
			</Table>
		</Box>
	);
};

export default FilesTable;
