import { Box, Table, Th, Tr } from "@chakra-ui/react";
import { StorageReference } from "firebase/storage";
import React from "react";
import File from "./File";

interface Props {
	childFiles: StorageReference[];
}

const FilesTable: React.FC<Props> = ({ childFiles }) => {
	return (
		<Box borderWidth="1px" borderRadius="lg" overflowX="auto" mx="4">
			<Table w="full">
				<thead>
					<Tr>
						<Th>Name</Th>
						<Th>Size</Th>
						<Th>Share</Th>
						<Th>Download</Th>
						<Th>Delete</Th>
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
