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

  const [selectedType, setSelectedType] = useState("Select Type");
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");

  const handleSave = () => {
    setKeyInput("")
    setValueInput("");
    setSelectedType("Select Type");
    toast.success(`Filter System successfully applied.`);
  }

  const handleCancel = () => {
    setKeyInput("")
    setValueInput("");
    setSelectedType("Select Type");
    onClose();
  }


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
        <ModalContent p="0">
          <Flex align="center" justify="space-between" p="4">
            <Text fontSize="2xl" fontWeight="600" overflow="hidden">
              Filter by
            </Text>
            <ModalCloseButton size="md" />
          </Flex>

          <Menu placement="bottom-end">
            {(props) => (
              <React.Fragment>
                <MenuButton as={Button} mx={4} rightIcon={props.isOpen ? <ChevronUp /> : <ChevronDown />}>
                {selectedType}
                </MenuButton>
                <Box>
                  <MenuList marginX="3">
                    <MenuItem onClick={() => setSelectedType("Key")}>Key</MenuItem>
                    <MenuItem onClick={() => setSelectedType("Value")}>Value</MenuItem>
                    <MenuItem onClick={() => setSelectedType("Key and Value")}>Key and Value</MenuItem>
                  </MenuList>
                </Box>
              </React.Fragment>
            )}
          </Menu>
          {selectedType === "Key" && (
          <Input 
            placeholder="Enter key"
            value = {keyInput}
            onChange = {(e) => setKeyInput(e.target.value)}
            mt={4} mx={4}
            width="calc(100% - 2 * 1rem)"
            />
          )}
            {selectedType === "Value" && (
              <Input 
              placeholder="Enter value"
              value = {valueInput}
              onChange = {(e) => setValueInput(e.target.value)}
              mt={4} mx={4}
              width="calc(100% - 2 * 1rem)"
              />
            )}
            {selectedType === "Key and Value" && (
              <Flex mt={4} ml={4}>
                <Input 
                placeholder="Enter key"
                value = {keyInput}
                onChange = {(e) => setKeyInput(e.target.value)}
                mr={4}
                />
                <Input 
                placeholder="Enter value"
                value = {valueInput}
                onChange = {(e) => setValueInput(e.target.value)}
                mr={4} 
                />
              </Flex>
            )}


            <ModalFooter>
                <Button onClick={handleSave} colorScheme='green' mr={3}>Save</Button>
                <Button onClick={handleCancel}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      );
}

export default FilterTags;