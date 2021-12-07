import { Flex, MenuItem, MenuList, Text, useColorModeValue } from "@chakra-ui/react";
import { StorageReference } from "@firebase/storage";
import {
	faExternalLinkAlt,
	faFolderOpen,
	faPlus,
	faTrash
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ContextMenu } from "chakra-ui-contextmenu";
import { useRouter } from "next/router";
import React from "react";

interface Props {
	folder: StorageReference;
}

const Folder: React.FC<Props> = ({ folder }) => {
	const router = useRouter();
	return (
		<ContextMenu<HTMLDivElement>
			renderMenu={() => (
				<MenuList>
					<MenuItem
						icon={<FontAwesomeIcon icon={faPlus} />}
						onClick={() => router.push(`/folder/${folder.fullPath}`)}
					>
						Open
					</MenuItem>
					<MenuItem
						icon={<FontAwesomeIcon icon={faExternalLinkAlt} />}
						onClick={() => {
							const domain = process.env.DEPLOY_URL || "http://localhost:3000";
							window.open(`${domain}/folder/${folder.fullPath}`, "_blank");
						}}
					>
						Open in new tab
					</MenuItem>
					<MenuItem
						icon={<FontAwesomeIcon icon={faTrash} />}
						onClick={() => {
							// we have to do all of this 👇 bs because we're using firestore,
							// let's move to cloud and come to this later.
							// first get all those folders whose parentId === folder.id
							// then loop through each of these folders and get all folders whose parentId === folder.id
							// continue until reached end.
							// loop through all these child folders and get all child files
							// delete all the files from bucket using file.name(??)
							// delete file documents where folderId === folder.id
							// delete the folders now from firestore
						}}
					>
						Delete Folder (and its contents)
					</MenuItem>
				</MenuList>
			)}
		>
			{(ref) => (
				<Flex
					onClick={() => router.push(`/folder/${folder.fullPath}`)}
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
					ref={ref}
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
			)}
		</ContextMenu>
	);
};

export default Folder;
