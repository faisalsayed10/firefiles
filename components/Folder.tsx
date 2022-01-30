import { Flex, MenuItem, MenuList, Text, useColorModeValue } from "@chakra-ui/react";
import { deleteObject, getStorage, listAll, ref, StorageReference } from "@firebase/storage";
import {
	faExternalLinkAlt,
	faFolderOpen,
	faPlus,
	faTrash
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useFirebase from "@hooks/useFirebase";
import { ContextMenu } from "chakra-ui-contextmenu";
import router, { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import DeleteAlert from "./DeleteAlert";

interface Props {
	folder: StorageReference;
	setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
}

const deleteLocalFolder = (folder: StorageReference) => {
	const id = router.asPath.split("/")[2];
	const localFolders = localStorage.getItem(`local_folders_${id}`);
	if (localFolders) {
		const folders = JSON.parse(localFolders);
		const filtered = folders.filter((f) => !f.fullPath.includes(folder.fullPath));
		localStorage.setItem(`local_folders_${id}`, JSON.stringify(filtered));
	}
};

const recursiveDelete = async (folders: StorageReference[], files: StorageReference[]) => {
	for (const file of files) {
		deleteObject(file);
	}
	if (!folders || folders.length < 1) {
		return;
	} else {
		for (const folder of folders) {
			const subFolders = await listAll(folder);
			return recursiveDelete(subFolders.prefixes, subFolders.items);
		}
	}
};

const Folder: React.FC<Props> = ({ folder, setIsFolderDeleting }) => {
	const [isOpen, setIsOpen] = useState(false);
	const onClose = () => setIsOpen(false);
	const router = useRouter();
	const cancelRef = useRef();
	const { app, removeFolder } = useFirebase();

	return (
		<ContextMenu<HTMLDivElement>
			renderMenu={() => (
				<MenuList>
					<MenuItem
						icon={<FontAwesomeIcon icon={faPlus} />}
						onClick={() => router.push(`${router.asPath}/${folder.name}`)}
					>
						Open
					</MenuItem>
					<MenuItem
						icon={<FontAwesomeIcon icon={faExternalLinkAlt} />}
						onClick={() => window.open(`${router.asPath}/${folder.name}`, "_blank")}
					>
						Open in new tab
					</MenuItem>
					<MenuItem icon={<FontAwesomeIcon icon={faTrash} />} onClick={() => setIsOpen(true)}>
						Delete Folder (and its contents)
					</MenuItem>
				</MenuList>
			)}
		>
			{(reactRef: React.RefObject<HTMLDivElement>) => (
				<>
					<DeleteAlert
						cancelRef={cancelRef}
						onClose={onClose}
						isOpen={isOpen}
						onClick={async () => {
							try {
								if (!app) return;
								const storage = getStorage(app);

								setIsFolderDeleting(true);
								onClose();
								const currentRef = ref(storage, decodeURIComponent(folder.fullPath) + "/");
								const res = await listAll(currentRef);

								removeFolder(folder);
								deleteLocalFolder(folder);
								recursiveDelete(res.prefixes, res.items);
							} catch (err) {
								console.error(err);
							} finally {
								setIsFolderDeleting(false);
							}
						}}
					/>
					<Flex
						onClick={() => router.push(`${router.asPath}/${folder.name}`)}
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
						ref={reactRef}
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
				</>
			)}
		</ContextMenu>
	);
};

export default Folder;
