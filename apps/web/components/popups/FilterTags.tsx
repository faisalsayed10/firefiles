import React, { useState } from "react";
import {
  Box,
  Flex,
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
  MenuItem,
} from "@chakra-ui/react";
import { ChevronUp, ChevronDown } from "tabler-icons-react";
import toast from "react-hot-toast";
import { TagFilter } from "@util/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fileTagFilter: TagFilter;
  setFileTagFilter: React.Dispatch<React.SetStateAction<TagFilter>>;
}

const FilterTags: React.FC<Props> = ({ isOpen, onClose, fileTagFilter, setFileTagFilter }) => {
  const [selectedType, setSelectedType] = useState("Key");
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");

  const handleSave = () => {
    if (selectedType === "Value") {
      setFileTagFilter({ value: valueInput });
      toast.success(`Filter successfully applied.`);
    } else {
      // check if key is empty before applying key filter
      if (keyInput === "") {
        toast.error("Filter key is empty.");
        return;
      } else {
        // key inputs are trimmed, in accordance with key inputs when modifying tags
        if (selectedType === "Key and Value") {
          setFileTagFilter({ key: keyInput.trim(), value: valueInput });
          toast.success(`Filter successfully applied.`);
        } else if (selectedType === "Key") {
          setFileTagFilter({ key: keyInput.trim() });
          toast.success(`Filter successfully applied.`);
        }
      }
    }
  };

  const handleCancel = () => {
    setKeyInput("");
    setValueInput("");
    setFileTagFilter({});
    toast.success(`Filter successfully cleared.`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent p="0">
        <Flex align="center" justify="space-between" p="4">
          {!fileTagFilter.hasOwnProperty("key") && !fileTagFilter.hasOwnProperty("value") ? (
            <Text fontSize="2xl" fontWeight="600" overflow="hidden">
              Filter by
            </Text>
          ) : (
            <Text fontSize="2xl" fontWeight="600" overflow="hidden">
              Filtering by: <Text />
              {fileTagFilter.key ? (
                <Text fontSize="xl" fontWeight="600" overflow="hidden">
                  {" "}
                  Key: {fileTagFilter.key}{" "}
                </Text>
              ) : null}
              {fileTagFilter.value ? (
                <Text fontSize="xl" fontWeight="600" overflow="hidden">
                  {" "}
                  Value: {fileTagFilter.value}{" "}
                </Text>
              ) : null}
            </Text>
          )}
          <ModalCloseButton size="md" />
        </Flex>

        <Menu placement="bottom-end">
          {(props) => (
            <React.Fragment>
              <MenuButton
                as={Button}
                mx={4}
                rightIcon={props.isOpen ? <ChevronUp /> : <ChevronDown />}
              >
                {selectedType}
              </MenuButton>
              <Box>
                <MenuList marginX="3">
                  <MenuItem onClick={() => setSelectedType("Key")}>Key</MenuItem>
                  <MenuItem onClick={() => setSelectedType("Value")}>Value</MenuItem>
                  <MenuItem onClick={() => setSelectedType("Key and Value")}>
                    Key and Value
                  </MenuItem>
                </MenuList>
              </Box>
            </React.Fragment>
          )}
        </Menu>
        {selectedType === "Key" && (
          <Input
            placeholder="Enter key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            mt={4}
            mx={4}
            width="calc(100% - 2 * 1rem)"
          />
        )}
        {selectedType === "Value" && (
          <Input
            placeholder="Enter value"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            mt={4}
            mx={4}
            width="calc(100% - 2 * 1rem)"
          />
        )}
        {selectedType === "Key and Value" && (
          <Flex mt={4} ml={4}>
            <Input
              placeholder="Enter key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              mr={4}
            />
            <Input
              placeholder="Enter value"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              mr={4}
            />
          </Flex>
        )}
        <ModalFooter>
          <Button onClick={handleSave} colorScheme="green" mr={3}>
            Save
          </Button>
          <Button onClick={handleCancel}>Clear Filter</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FilterTags;
