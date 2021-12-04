import {
	Box,
	Button,
	Flex,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	useColorModeValue,
	useDisclosure,
	useToast
} from "@chakra-ui/react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { database, firestore } from "@util/firebase";
import { FolderCollection } from "@util/types";
import { ROOT_FOLDER } from "@util/useFolder";
import { doc, setDoc } from "firebase/firestore";
import React, { useRef, useState } from "react";
import uniqid from "uniqid";

interface Props {
	currentFolder: FolderCollection;
}

const AddFolderButton: React.FC<Props> = ({ currentFolder }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const inputRef = useRef<HTMLInputElement>();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		if (/[#\$\[\]\*/]/.test(name)) {
			toast({
				title: "Invalid Folder Name",
				description: "Folder names cannot contain #$[]*/",
				status: "error",
				duration: 3000,
				isClosable: true
			});
			setLoading(false);
			return;
		}

		if (currentFolder === null) return;
		const path = [...currentFolder.path];
		if (currentFolder !== ROOT_FOLDER) {
			path.push({ name: currentFolder.name, id: currentFolder.id });
		}

		await setDoc(doc(firestore, "folders", uniqid()), {
			name,
			parentId: currentFolder.id,
			path,
			createdAt: database.getCurrentTimestamp()
		});

		toast({
			title: "Folder Created Successfully",
			description: "",
			status: "success",
			duration: 3000,
			isClosable: true
		});

		setName("");
		setLoading(false);
		onClose();
	};

	return (
		<>
			<Flex
				onClick={onOpen}
				direction="column"
				align="center"
				justify="center"
				boxShadow="5.5px 4.2px 7.8px -1.7px rgba(0, 0, 0, 0.1)"
				transition="ease-in-out 0.1s"
				cursor="pointer"
				className="hoverAnim"
				color={useColorModeValue("#2D3748", "white")}
				w="110px"
				h="110px"
			>
				<FontAwesomeIcon icon={faPlus} size="2x" />
			</Flex>
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
							<Button variant="ghost" type="submit" colorScheme="green" isLoading={loading}>
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
