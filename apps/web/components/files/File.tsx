import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import useBucket from "@hooks/useBucket";
import { DriveFile } from "@util/types";
import copy from "copy-to-clipboard";
import { nanoid } from "nanoid";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import DeleteAlert from "../popups/DeleteAlert";
import FileGrid from "./FileGrid";
import FilePreview from "./FilePreview";
import FileRow from "./FileRow";
import TagsPopup from "../popups/TagsPopup";

interface Props {
  file: DriveFile;
  gridView?: boolean;
}

const File: React.FC<Props> = ({ file, gridView = false }) => {
const [isOpen, setIsOpen] = useState(false);
const { removeFile, enableTags } = useBucket();
const [id] = useState(nanoid());
const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
const cancelRef = useRef();
const { isOpen: isTagsOpen, onOpen: onTagsOpen, onClose: onTagsClose } = useDisclosure();

  const copyFile = () => {
    copy(file.url);
    toast.success("File URL copied to clipboard!");
  };

  const deleteFile = async () => {
    try {
      const success = await removeFile(file);
      if (!success) return;

			setIsOpen(false);
			toast.success("File deleted successfully!");
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
	const handleTagsOpen = () => {
		onTagsOpen();
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
					onTagsOpen={handleTagsOpen}
				/>
			) : (
				<FileRow
					copyFile={copyFile}
					file={file}
					id={id}
					onPreviewOpen={onPreviewOpen}
					setIsOpen={setIsOpen}
					onTagsOpen={handleTagsOpen}
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
				<ModalContent p="0" w="auto" maxH="700px">
					<ModalCloseButton _focus={{ outline: "none", border: "none" }} zIndex="100" />
					<FilePreview url={file.url} file={file} />
				</ModalContent>
			</Modal>
			{enableTags ? (<TagsPopup isOpen={isTagsOpen} onClose={onTagsClose} file={file} />):(null)}
		</>
	);
};

export default File;
