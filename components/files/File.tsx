import {
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Text,
	useDisclosure
} from "@chakra-ui/react";
import useBucket from "@hooks/useBucket";
import useKeys from "@hooks/useKeys";
import { sendEvent } from "@util/firebase";
import { BucketFile, BucketType } from "@util/types";
import copy from "copy-to-clipboard";
import { nanoid } from "nanoid";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import DeleteAlert from "../popups/DeleteAlert";
import FileGrid from "./FileGrid";
import FilePreview from "./FilePreview";
import FileRow from "./FileRow";

interface Props {
	file: BucketFile;
	gridView: boolean;
}

const File: React.FC<Props> = ({ file, gridView }) => {
	const [isOpen, setIsOpen] = useState(false);
	const { keys } = useKeys();
	const { removeFile } = useBucket(BucketType[keys.type]);
	const [id] = useState(nanoid());
	const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
	const cancelRef = useRef();

	const copyFile = () => {
		copy(file.url);
		toast.success("File URL copied to clipboard!");
		sendEvent("file_share", {});
	};

	const deleteFile = async () => {
		try {
			const success = await removeFile(file);
			if (!success) return;

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
					file={file}
					id={id}
					onPreviewOpen={onPreviewOpen}
					setIsOpen={setIsOpen}
				/>
			) : (
				<FileRow
					copyFile={copyFile}
					file={file}
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
					<ModalCloseButton _focus={{ outline: "none", border: "none" }} zIndex="100" />
					<FilePreview url={file.url} file={file} />
				</ModalContent>
			</Modal>
		</>
	);
};

export default File;
