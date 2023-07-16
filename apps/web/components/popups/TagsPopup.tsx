import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  Center
} from "@chakra-ui/react";
import { X, Plus, Check, Minus } from "tabler-icons-react";
import { DriveFile } from "@util/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: DriveFile;
}

const TagsPopup: React.FC<Props> = ({ isOpen, onClose, file }) => {
  const [tags, setTags] = useState([]);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");

  const handleAddTag = () => {
    setAddingTag(true);
  };

  const handleSaveTag = () => {
    const newTag = { key: newTagKey, value: newTagValue };
    setTags([...tags, newTag]);
    setNewTagKey("");
    setNewTagValue("");
    setAddingTag(false);
  };

  const handleCancelTag = () => {
    setNewTagKey("");
    setNewTagValue("");
    setAddingTag(false);
  };

  const handleRemoveTag = (index) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent p="0">
        <Flex align="center" justify="space-between" p="4">
          <Text fontSize="2xl" fontWeight="600">
            TAGS
          </Text>
          <ModalCloseButton size='md'/>
        </Flex>
        <Flex key="header" mt="2">
            <Text flex="1" fontWeight="bold" ml="4">
            Key
            </Text>
            <Text flex="1" fontWeight="bold" mr="10">
            Value
            </Text>
        </Flex>
        <Box p="4">
          {tags.map((tag, index) => (
            <Flex key={index} mb="2">
              <Text flex="1">{tag.key}</Text>
              <Text flex="1" ml="4">
                {tag.value}
              </Text>
              <IconButton
                aria-label="Remove Tag"
                icon={<Minus width={38}/>}
                variant="unstyled"
                _focus={{ outline: "none" }}
                onClick={() => handleRemoveTag(index)}
                _hover={{ bg: "hsl(60, 0%, 95%)" }}
              />
            </Flex>
          ))}
          {addingTag ? (
            <Flex mb="2">
              <Input
                flex="1"
                placeholder="Key"
                value={newTagKey}
                onChange={(e) => setNewTagKey(e.target.value)}
              />
              <Input
                flex="1"
                ml="2"
                placeholder="Value"
                value={newTagValue}
                onChange={(e) => setNewTagValue(e.target.value)}
              />
              <IconButton
                aria-label="Cancel"
                icon={<X width={38}/>}
                alignContent="center"
                variant="unstyled"
                _focus={{ outline: "none" }}
                onClick={handleCancelTag}
                _hover={{ bg: "hsl(60, 0%, 95%)" }} 
              />
              <IconButton
                aria-label="Save Tag"
                icon={<Check width={38}/>}
                variant="unstyled"
                _focus={{ outline: "none" }}
                onClick={handleSaveTag}
                _hover={{ bg: "hsl(60, 0%, 95%)" }} 
              />
            </Flex>
          ) : (
            <Flex align="center" justify="flex-end">
              <IconButton
                aria-label="Add Tag"
                icon={<Plus width={38}/>}
                variant="unstyled"
                _focus={{ outline: "none" }}
                onClick={handleAddTag}
                _hover={{ bg: "hsl(60, 0%, 95%)" }}
              />
            </Flex>
          )}
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default TagsPopup;
