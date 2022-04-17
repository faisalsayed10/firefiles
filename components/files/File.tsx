import {
	IconButton,
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Td,
	Text,
	Tr,
	useClipboard,
	useDisclosure
} from "@chakra-ui/react";
import useFirebase from "@hooks/useFirebase";
import { sendEvent } from "@util/firebase";
import { download } from "@util/helpers";
import axios from "axios";
import { User } from "firebase/auth";
import { deleteObject, getStorage, ref, StorageReference } from "firebase/storage";
import { nanoid } from "nanoid";
import prettyBytes from "pretty-bytes";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import useSWRImmutable from "swr/immutable";
import { Copy, FileDownload, FileMinus } from "tabler-icons-react";
import DeleteAlert from "../popups/DeleteAlert";
import FileIcon from "./FileIcon";
import FilePreview from "./FilePreview";

interface Props {
	file: StorageReference;
}

const firebase_url = `https://firebasestorage.googleapis.com/v0/b`;
const metaFetcher = async (url: string, user: User) =>
	axios
		.get(url, { headers: { Authorization: `Firebase ${await user.getIdToken()}` } })
		.then(({ data }) => data);

const File: React.FC<Props> = ({ file }) => {
	const [isOpen, setIsOpen] = useState(false);
	const { app, appUser, removeFile } = useFirebase();
	const file_url = `${firebase_url}/${file.bucket}/o/${encodeURIComponent(file.fullPath)}`;
	const [id] = useState(nanoid());
	const { data } = useSWRImmutable(file ? file.fullPath : null, () =>
		metaFetcher(file_url, appUser)
	);
	const { onCopy } = useClipboard(`${file_url}?alt=media&token=${data?.downloadTokens}`);
	const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
	const cancelRef = useRef();

	const handleClick = () => {
		onCopy();
		toast.success("File URL copied to clipboard!");
		sendEvent("file_share", {});
	};

	const deleteFile = async () => {
		try {
			if (!app) return;
			const storage = getStorage(app);

			const reference = ref(storage, `${file?.parent.fullPath}/${file.name}`);
			deleteObject(reference).catch((_) => {});
			removeFile(reference);
			setIsOpen(false);
			toast.success("File deleted successfully!");
			sendEvent("file_delete", {});
		} catch (err) {
			setIsOpen(false);
			console.error(err);
			toast.error(() => (
				<>
					<Text fontWeight="bold">Error deleting file!</Text>
					<Text as="p" fontSize="sm">
						{err.message}
					</Text>
				</>
			));
		}
	};

	return (
		<>
			<Tr>
				<Td maxW="36px">
					<FileIcon extension={file.name.split(".").pop()} id={id} />
				</Td>
				<Td
					fontWeight="medium"
					isTruncated
					maxW={["250px", "300px", "300px"]}
					onClick={onPreviewOpen}
					textDecor="underline"
					cursor="pointer"
					_hover={{ textDecor: "none" }}
				>
					{file.name}
				</Td>
				<Td minW="110px">{data && prettyBytes(parseInt(data.size) || 0)}</Td>
				<Td textAlign="center">
					<IconButton
						aria-label="Copy file URL"
						icon={<Copy />}
						onClick={handleClick}
						isLoading={!data}
						variant="outline"
						colorScheme="blue"
					/>
				</Td>
				<Td textAlign="center">
					<IconButton
						aria-label="Download file"
						icon={<FileDownload />}
						isLoading={!data}
						variant="outline"
						colorScheme="blue"
						onClick={() =>
							download(file.name, `${file_url}?alt=media&token=${data?.downloadTokens}`)
						}
					/>
				</Td>
				<Td textAlign="center">
					<IconButton
						aria-label="Delete file"
						icon={<FileMinus />}
						onClick={() => setIsOpen(true)}
						variant="outline"
						colorScheme="red"
					/>
					<DeleteAlert
						isOpen={isOpen}
						onClose={() => setIsOpen(false)}
						cancelRef={cancelRef}
						onClick={deleteFile}
					/>
				</Td>
			</Tr>
			<Modal isOpen={isPreviewOpen} onClose={onPreviewClose} isCentered size="xl" autoFocus={false}>
				<ModalOverlay />
				<ModalContent p="0" maxH="700px">
					<ModalCloseButton _focus={{ outline: "none", border: "none" }} />
					<FilePreview
						mimetype={data?.contentType}
						url={`${file_url}?alt=media&token=${data?.downloadTokens}`}
						file={file}
					/>
				</ModalContent>
			</Modal>
		</>
	);
};

export default File;
