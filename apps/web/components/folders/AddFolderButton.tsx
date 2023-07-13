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
} from "@chakra-ui/react";
import useBucket from "@hooks/useBucket";
import useKeys from "@hooks/useKeys";
import { DriveFolder, Provider } from "@util/types";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FolderPlus } from "tabler-icons-react";

interface Props {
  currentFolder: DriveFolder;
}

const AddFolderButton: React.FC<Props> = ({ currentFolder }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>();
  const { addFolder } = useBucket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (/[#\$\[\]\*/]/.test(name)) {
      toast.error("Folder name cannot contain special characters.");
      setLoading(false);
      return;
    }

    if (currentFolder === null) return;

    addFolder(name);
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
        transition="ease-in-out 0.1s"
        cursor="pointer"
        className="hoverAnim"
        color={useColorModeValue("#2D3748", "white")}
        w={["140px", "180px", "180px"]}
        h="140px"
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="5.5px 4.2px 7.8px -1.7px rgba(0, 0, 0, 0.1)"
      >
        <FolderPlus size={72} strokeWidth="1px" />
      </Flex>
      <Modal initialFocusRef={inputRef} isOpen={isOpen} onClose={onClose} autoFocus={false}>
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
