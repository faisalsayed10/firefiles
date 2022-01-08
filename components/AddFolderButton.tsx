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
	useDisclosure
} from "@chakra-ui/react";
import { StorageReference } from "@firebase/storage";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ACTIONS, ReducerAction } from "hooks/useFolder";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

interface Props {
	dispatch: React.Dispatch<ReducerAction>;
	currentFolder: StorageReference;
}

const AddFolderButton: React.FC<Props> = ({ currentFolder, dispatch }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		if (/[#\$\[\]\*/]/.test(name)) {
			toast.error("Folder name cannot contain special characters.");
			setLoading(false);
			return;
		}

		if (currentFolder === null) return;

		const path =
			currentFolder.fullPath !== ""
				? decodeURIComponent(currentFolder.fullPath) + "/" + name
				: name;

		const newFolder = {
			name,
			fullPath: path,
			root: null,
			bucket: null,
			storage: null,
			parent: null
		};

		dispatch({ type: ACTIONS.ADD_FOLDER, payload: { childFolders: [newFolder] } });

		const localFolders = localStorage.getItem("local-folders");
		const folders: StorageReference[] = localFolders ? JSON.parse(localFolders) : [];
		localStorage.setItem("local-folders", JSON.stringify([...folders, newFolder]));

		toast.success("Folder Created Successfully.");
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
