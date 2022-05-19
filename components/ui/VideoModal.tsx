import {
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { Player } from "video-react";

type Props = {
	src: string;
};

const VideoModal: React.FC<Props> = ({ src }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<>
			<Button
				onClick={onOpen}
				size="sm"
				variant="link"
				colorScheme="black"
				my="2"
				_focus={{ outline: "none" }}
			>
				How do I get the credentials?
			</Button>

			<Modal isOpen={isOpen} onClose={onClose} isCentered>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader py="2" px="4">
						Here's How:
					</ModalHeader>
					<ModalCloseButton _focus={{ outline: "none" }} />
					<ModalBody p="0">
						<Player playsInline src={src} />
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default VideoModal;
