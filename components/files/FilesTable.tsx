import { Box, Table, Th, Tr } from "@chakra-ui/react";
import { DriveFile } from "@util/types";
import React from "react";
import File from "./File";

interface Props {
	files: DriveFile[];
}

const FilesTable: React.FC<Props> = ({ files }) => {
	return (
		<Box borderWidth="1px" borderRadius="lg" overflowX="auto" p="4" mx="4" mb="4">
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
					{files.length > 0 && files.map((file) => <File key={file.name} file={file} />)}
				</tbody>
			</Table>
		</Box>
	);
};

export default FilesTable;
