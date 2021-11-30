import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FolderCollection } from "@util/types";
import { useRouter } from "next/router";
import React from "react";

interface Props {
	folder: FolderCollection;
}

const Folder: React.FC<Props> = ({ folder }) => {
	const router = useRouter();
	return (
		<Flex
			onClick={() =>
				router.push(`/folder/${folder.id}?folder=${JSON.stringify(folder)}`, `/folder/${folder.id}`)
			}
			direction="column"
			align="center"
			justify="space-between"
			boxShadow="5.5px 4.2px 7.8px -1.7px rgba(0, 0, 0, 0.1)"
			transition="ease-in-out 0.1s"
			cursor="pointer"
			className="hoverAnim"
			w="110px"
			h="110px"
			pt="4"
			pb="2"
		>
			<FontAwesomeIcon
				icon={faFolderOpen}
				size="3x"
				color={useColorModeValue("#2D3748", "white")}
			/>
			<Text isTruncated={true} as="p" fontSize="xs" align="center" px="2" maxW="105px">
				{folder.name}
			</Text>
		</Flex>
	);
};

export default Folder;
