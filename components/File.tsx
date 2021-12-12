import { Box, Button, Td, useClipboard, useToast } from "@chakra-ui/react";
import { deleteDoc, doc } from "@firebase/firestore";
import { faCopy, faDownload, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { firestore, storage } from "@util/firebase";
import { FileCollection } from "@util/types";
import { deleteObject, ref } from "firebase/storage";
import prettyBytes from "pretty-bytes";
import React, { useRef, useState } from "react";
import DeleteAlert from "./DeleteAlert";

interface Props {
	file: FileCollection;
}

const File: React.FC<Props> = ({ file }) => {
	const { onCopy } = useClipboard(file.url);
	const toast = useToast();
	const [isOpen, setIsOpen] = useState(false);
	const cancelRef = useRef();

	const handleClick = () => {
		onCopy();
		toast({
			title: "Copied",
			description: "File URL copied to clipboard!",
			status: "success",
			duration: 1000,
			isClosable: true
		});
	};

	const deleteFile = async () => {
		try {
			deleteObject(ref(storage, `${file.parentPath}/${file.name}`)).catch((e) => {});
			deleteDoc(doc(firestore, "files", file.id)).catch((e) => {});
			setIsOpen(false);
			toast({
				title: "Deleted",
				description: "File deleted successfully!",
				status: "info",
				duration: 1000,
				isClosable: true
			});
		} catch (err) {
			setIsOpen(false);
			console.error(err);
			toast({
				title: "An Error Occurred",
				description: err.message,
				status: "error",
				duration: 3000,
				isClosable: true
			});
		}
	};

	return (
		<Box as="tr">
			<Td fontWeight="medium" isTruncated>
				{file.name}
			</Td>
			<Td>{file && prettyBytes(file.size || 0)}</Td>
			<Td>
				<Button onClick={handleClick} variant="outline" colorScheme="cyan">
					<FontAwesomeIcon icon={faCopy} />
				</Button>
			</Td>
			<Td>
				<a href={file.url} target="_blank" rel="noreferrer" download={file.url}>
					<Button variant="outline" colorScheme="cyan">
						<FontAwesomeIcon icon={faDownload} />
					</Button>
				</a>
			</Td>
			<Td>
				<Button onClick={() => setIsOpen(true)} variant="outline" colorScheme="cyan">
					<FontAwesomeIcon icon={faMinus} />
				</Button>
				<DeleteAlert
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
					cancelRef={cancelRef}
					onClick={deleteFile}
				/>
			</Td>
		</Box>
	);
};

export default File;
