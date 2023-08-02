import React, { useEffect, useState } from "react";
import {
    Box,
    Flex,
    IconButton,
    Input,
    Modal,
    ModalCloseButton,
    ModalContent,
    ModalOverlay,
    ModalFooter,
    Text,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem
} from "@chakra-ui/react";
import { ChevronUp, ChevronDown } from "tabler-icons-react";
import toast from "react-hot-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

const FilterTags: React.FC<Props> = ({ isOpen, onClose}) => {
  const [selection, setSelection] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("Select Type");
  // const [inputValue, setInputValue] = useState("");


  const handleCancel = () => {
    setInputValue("");
    setSelectedType("Select Type");
    onClose();
  }


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
        <ModalContent >
          <Flex align="center" justify="space-between" p="5">
            <Text fontSize="2xl" fontWeight="600" overflow="hidden">
              Filter by
            </Text>
            <ModalCloseButton size="md" />
          </Flex>

          <Menu p="5">
            {(props) => (
              <React.Fragment>
                <MenuButton as={Button} rightIcon={props.isOpen ? <ChevronUp /> : <ChevronDown />}>
                {selectedType}
                </MenuButton>

                <Box>
                  <MenuList>
                    <MenuItem onClick={() => setSelectedType("Key")}>Key</MenuItem>
                    <MenuItem onClick={() => setSelectedType("Value")}>Value</MenuItem>
                    <MenuItem onClick={() => setSelectedType("Key and Value")}>Key and Value</MenuItem>
                  </MenuList>
                </Box>
              </React.Fragment>
            )}
          </Menu>

            {selectedType === "Key" && (
              <Input placeholder="Enter key" mt={4} mx={4} />
            )}
            {selectedType === "Value" && (
              <Input placeholder="Enter value" mt={4} ml={4}/>
            )}
            {selectedType === "Key and Value" && (
              <Flex mt={4} ml={4}>
                <Input placeholder="Enter key"  mr={4}/>
                <Input placeholder="Enter value" mr={4} />
              </Flex>
            )}


            <ModalFooter>
                <Button colorScheme='green' mr={3}>
                    Save
                </Button>
                <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
         
          </ModalContent>
        </Modal>
      );
}

export default FilterTags;