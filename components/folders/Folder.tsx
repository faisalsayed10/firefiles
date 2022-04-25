import { Flex, MenuDivider, Text, useColorModeValue } from "@chakra-ui/react";
import OptionsPopover from "@components/popups/OptionsPopover";
import { deleteObject, getStorage, listAll, ref, StorageReference } from "@firebase/storage";
import useFirebase from "@hooks/useFirebase";
import { sendEvent } from "@util/firebase";
import router, { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { ExternalLink, FolderMinus, Plus, Folder as FolderIcon } from "tabler-icons-react";
import DeleteAlert from "../popups/DeleteAlert";

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

	const optionProps = {
		p: 2,
		cursor: "pointer",
		_hover: { backgroundColor: useColorModeValue("gray.100", "rgba(237, 242, 247, 0.1)") },
	};

	return (
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
						sendEvent("folder_delete", {});
					} catch (err) {
						console.error(err);
					} finally {
						setIsFolderDeleting(false);
					}
				}}
			/>
			<Flex
				cursor="pointer"
				direction="column"
				align="center"
				borderRadius="lg"
				boxShadow="5.5px 4.2px 7.8px -1.7px rgba(0, 0, 0, 0.1)"
				w="100%"
				h="140px"
				borderWidth="1px"
				transition="ease-in-out 0.1s"
				className="hoverAnim"
			>
				<FolderIcon
					onClick={() => router.push(`${router.asPath}/${folder.name}`)}
					style={{ flex: 1, strokeWidth: "1px", color: useColorModeValue("#2D3748", "white") }}
					size={72}
				/>
				<Flex p="2" w="full" justify="space-between" alignItems="center">
					<Text
						onClick={() => router.push(`${router.asPath}/${folder.name}`)}
						flex="1"
						isTruncated={true}
						as="p"
						fontSize="xs"
						align="left"
						px="2"
					>
						{folder.name}
					</Text>
					<OptionsPopover header={folder.name}>
						<Flex alignItems="stretch" flexDirection="column">
							<Flex {...optionProps} onClick={() => router.push(`${router.asPath}/${folder.name}`)}>
								<Plus />
								<Text ml="2">Open</Text>
							</Flex>
							<MenuDivider />
							<Flex
								{...optionProps}
								onClick={() => window.open(`${router.asPath}/${folder.name}`, "_blank")}
							>
								<ExternalLink />
								<Text ml="2">Open in new tab</Text>
							</Flex>
							<MenuDivider />
							<Flex {...optionProps} onClick={() => setIsOpen(true)}>
								<FolderMinus />
								<Text ml="2">Delete Folder</Text>
							</Flex>
						</Flex>
					</OptionsPopover>
				</Flex>
			</Flex>
		</>
	);
};

export default Folder;
