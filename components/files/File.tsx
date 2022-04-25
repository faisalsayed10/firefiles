import {
	IconButton,
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Text,
	useClipboard,
	useDisclosure,
} from "@chakra-ui/react";
import useFirebase from "@hooks/useFirebase";
import { sendEvent } from "@util/firebase";
import axios from "axios";
import { User } from "firebase/auth";
import { deleteObject, getStorage, ref, StorageReference } from "firebase/storage";
import { nanoid } from "nanoid";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import useSWRImmutable from "swr/immutable";
import { Copy, FileDownload, FileMinus } from "tabler-icons-react";
import DeleteAlert from "../popups/DeleteAlert";
import FileGrid from "./FileGrid";
import FilePreview from "./FilePreview";
import FileRow from "./FileRow";

interface Props {
	file: StorageReference;
	gridView?: boolean;
}

const firebase_url = `https://firebasestorage.googleapis.com/v0/b`;
const metaFetcher = async (url: string, user: User) =>
	axios
		.get(url, { headers: { Authorization: `Firebase ${await user.getIdToken()}` } })
		.then(({ data }) => data);

const File: React.FC<Props> = ({ file, gridView }) => {
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

	const copyFile = () => {
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
			{gridView ? (
				<FileGrid
					copyFile={copyFile}
					data={data}
					file={file}
					file_url={file_url}
					id={id}
					onPreviewOpen={onPreviewOpen}
					setIsOpen={setIsOpen}
				/>
			) : (
				<FileRow
					copyFile={copyFile}
					data={data}
					file={file}
					file_url={file_url}
					id={id}
					onPreviewOpen={onPreviewOpen}
					setIsOpen={setIsOpen}
				/>
			)}

			<DeleteAlert
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				cancelRef={cancelRef}
				onClick={deleteFile}
			/>
			<Modal isOpen={isPreviewOpen} onClose={onPreviewClose} isCentered size="xl">
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
