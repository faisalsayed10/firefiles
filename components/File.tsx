import {
	Box,
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Td,
	Text,
	useClipboard,
	useDisclosure
} from "@chakra-ui/react";
import { faCopy, faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useFirebase from "@hooks/useFirebase";
import { sendEvent } from "@util/firebase";
import { download } from "@util/helpers";
import axios from "axios";
import { User } from "firebase/auth";
import { deleteObject, getStorage, ref, StorageReference } from "firebase/storage";
import prettyBytes from "pretty-bytes";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import useSWRImmutable from "swr/immutable";
import DeleteAlert from "./DeleteAlert";
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
			<Box as="tr">
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
				<Td align="center">
					<Button onClick={handleClick} isLoading={!data} variant="outline" colorScheme="blue">
						<FontAwesomeIcon icon={faCopy} />
					</Button>
				</Td>
				<Td align="center">
					<Button
						isLoading={!data}
						variant="outline"
						colorScheme="blue"
						onClick={() =>
							download(file.name, `${file_url}?alt=media&token=${data?.downloadTokens}`)
						}
					>
						<FontAwesomeIcon icon={faDownload} />
					</Button>
				</Td>
				<Td>
					<Button onClick={() => setIsOpen(true)} variant="outline" colorScheme="red">
						<FontAwesomeIcon icon={faTrash} />
					</Button>
					<DeleteAlert
						isOpen={isOpen}
						onClose={() => setIsOpen(false)}
						cancelRef={cancelRef}
						onClick={deleteFile}
					/>
				</Td>
			</Box>
			<Modal isOpen={isPreviewOpen} onClose={onPreviewClose} isCentered size="xl">
				<ModalOverlay />
				<ModalContent p="0">
					<ModalCloseButton _focus={{ outline: "none", border: "none" }} />
					<ModalBody p="0">
						<FilePreview
							mimetype={data?.contentType}
							url={`${file_url}?alt=media&token=${data?.downloadTokens}`}
							file={file}
						/>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default File;
