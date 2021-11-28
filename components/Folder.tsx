import { Box, Image, Text } from "@chakra-ui/react";
import React from "react";
import { useRouter } from "next/router";
import { FolderCollection } from "@util/types";

interface Props {
	folder: FolderCollection;
}

const Folder: React.FC<Props> = ({ folder }) => {
	const router = useRouter();
	return (
		<Box
			onClick={() =>
				router.push(`/folder/${folder.id}?folder=${JSON.stringify(folder)}`, `/folder/${folder.id}`)
			}
			display="block"
			borderRadius="md"
			borderWidth="2px"
			className="hoverAnim"
			transition="ease-in-out 0.1s">
			<Image width="70px" margin="0 auto" src="/icons8-folder-512.png" alt={folder.name} />
			<Text isTruncated={true} as="h2" fontSize="xl" align="center" px="2">
				{folder.name}
			</Text>
		</Box>
	);
};

export default Folder;
