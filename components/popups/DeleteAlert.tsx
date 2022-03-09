import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
} from "@chakra-ui/react";
import React from "react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	cancelRef: React.RefObject<any>;
	onClick: () => void;
}

const DeleteAlert: React.FC<Props> = ({ isOpen, onClick, onClose, cancelRef }) => {
	return (
		<AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader fontSize="lg" fontWeight="bold">
						Delete Files
					</AlertDialogHeader>

					<AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>

					<AlertDialogFooter>
						<Button ref={cancelRef} onClick={onClose}>
							Cancel
						</Button>
						<Button colorScheme="red" onClick={onClick} ml={3}>
							Delete
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
};

export default DeleteAlert;
