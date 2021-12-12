import { Flex, MenuItem, MenuList, Text, useColorModeValue } from "@chakra-ui/react";
import { deleteObject, listAll, ref, StorageReference } from "@firebase/storage";
import {
	faExternalLinkAlt,
	faFolderOpen,
	faPlus,
	faTrash
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { firestore, storage } from "@util/firebase";
import { ACTIONS, ReducerAction } from "@util/useFolder";
import { ContextMenu } from "chakra-ui-contextmenu";
import { collection, getDocs, query, where, writeBatch } from "firebase/firestore";
import { useRouter } from "next/router";
import React from "react";
import DeleteAlert from "./DeleteAlert";

interface Props {
	folder: StorageReference;
	setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
	childFolders: StorageReference[];
	dispatch: React.Dispatch<ReducerAction>;
}

const deleteLocalFolder = (folder: StorageReference) => {
	const localFolders = localStorage.getItem("local-folders");
	if (localFolders) {
		const folders = JSON.parse(localFolders);
		const filtered = folders.filter((f) => !f.fullPath.includes(folder.fullPath));
		localStorage.setItem("local-folders", JSON.stringify(filtered));
	}
};

const deleteFirestoreFiles = (folder: StorageReference) => {
	console.log("deleting firestore files");
	const deleteBatch = writeBatch(firestore);
	getDocs(query(collection(firestore, "files"), where("parentPath", "==", folder.fullPath)))
		.then((snapshot) => {
			for (const doc of snapshot.docs) {
				deleteBatch.delete(doc.ref);
			}
		})
		.then(() => deleteBatch.commit());
};

const recursiveDelete = async (folders: StorageReference[], files: StorageReference[]) => {
	for (const file of files) {
		deleteObject(file);
	}
	if (!folders || folders.length < 1) {
		return;
	} else {
		for (const folder of folders) {
			deleteFirestoreFiles(folder);
			const subFolders = await listAll(folder);
			return recursiveDelete(subFolders.prefixes, subFolders.items);
		}
	}
};

const Folder: React.FC<Props> = ({ folder, setIsFolderDeleting, childFolders, dispatch }) => {
	const router = useRouter();
	const [isOpen, setIsOpen] = React.useState(false);
	const onClose = () => setIsOpen(false);
	const cancelRef = React.useRef();

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
								setIsFolderDeleting(true);
								onClose();
								const currentRef = ref(storage, decodeURIComponent(folder.fullPath) + "/");
								const res = await listAll(currentRef);

								dispatch({
									type: ACTIONS.SET_CHILD_FOLDERS,
									payload: {
										childFolders: childFolders.filter((f) => f.fullPath !== folder.fullPath)
									}
								});
								deleteLocalFolder(folder);
								deleteFirestoreFiles(folder);
								recursiveDelete(res.prefixes, res.items);
							} catch (err) {
								console.error(err);
							} finally {
								setIsFolderDeleting(false);
							}
						}}
					/>
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
