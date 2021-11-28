import {
	Box,
	Button,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	useDisclosure
} from "@chakra-ui/react";
import { faFolderPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { database, firestore } from "@util/firebase";
import { FolderCollection } from "@util/types";
import { ROOT_FOLDER } from "@util/useFolder";
import { doc, setDoc } from "firebase/firestore";
import React, { useRef, useState } from "react";
import { v4 } from "uuid";

interface Props {
	currentFolder: FolderCollection;
	btnWidth?: string;
	variant: string;
}

const AddFolderButton: React.FC<Props> = ({ currentFolder, btnWidth, variant }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [name, setName] = useState("");
	const inputRef = useRef<HTMLInputElement>();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (currentFolder === null) return;
		const path = [...currentFolder.path];
		if (currentFolder !== ROOT_FOLDER) {
			path.push({ name: currentFolder.name, id: currentFolder.id });
		}

		await setDoc(doc(firestore, "folders", v4()), {
			name,
			parentId: currentFolder.id,
			path,
			createdAt: database.getCurrentTimestamp()
		});
		setName("");
		onClose();
	};

	return (
		<>
			<Button
				leftIcon={<FontAwesomeIcon icon={faFolderPlus} />}
				variant={variant}
				colorScheme="cyan"
				width={btnWidth}
				onClick={onOpen}>
				Create A Folder
			</Button>
			<Modal initialFocusRef={inputRef} isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Create A Folder</ModalHeader>
					<ModalCloseButton />
					<Box as="form" onSubmit={handleSubmit}>
						<ModalBody>
							<Input
								ref={inputRef}
								type="text"
								required
								placeholder="Folder Name"
								variant="flushed"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</ModalBody>
						<ModalFooter>
							<Button variant="ghost" colorScheme="blue" onClick={onClose}>
								Close
							</Button>
							<Button variant="ghost" type="submit" colorScheme="green">
								Submit
							</Button>
						</ModalFooter>
					</Box>
				</ModalContent>
			</Modal>
		</>
	);
};

export default AddFolderButton;
