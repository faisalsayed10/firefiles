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
  Text,
} from "@chakra-ui/react";
import { X, Plus, Check, Minus } from "tabler-icons-react";
import { DriveFile } from "@util/types";
import useBucket from "@hooks/useBucket";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: DriveFile;
}

const TagsPopup: React.FC<Props> = ({ isOpen, onClose, file }) => {
  const { listTags, addTags, removeTags } = useBucket();
  const [tags, setTags] = useState<{key: string, value: string}[]>( []);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");

  const getTags = async () => {
    const tagList = await listTags(file);
    if (tagList) {
      setTags(tagList);
    } else {
      setTags([])
    }
  }

  const handleAddTag = () => {
    setAddingTag(true);
  };

  const handleSaveTag = async () => {
    await addTags(file, newTagKey, newTagValue);
    await getTags();
    setNewTagKey("");
    setNewTagValue("");
    setAddingTag(false);
    toast.success(`Tag successfully added.`)
  };

  const handleCancelTag = () => {
    setNewTagKey("");
    setNewTagValue("");
    setAddingTag(false);
  };

  const handleRemoveTag = async (key) => {
    await removeTags(file, key);
    await getTags();
    toast.success(`Tag successfully deleted.`)
  };

  // fetch tags on first render
  useEffect(() => {
    getTags()
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent p="0">
        <Flex align="center" justify="space-between" p="4">
          <Text fontSize="2xl" fontWeight="600">
            Tags for {file.name}
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
          {tags.map((tag) => (
            <Flex key={tag.key} mb="2">
              <Text flex="1">{tag.key}</Text>
              <Text flex="1" ml="4">
                {tag.value}
              </Text>
              <IconButton
                aria-label="Remove Tag"
                icon={<Minus width={38}/>}
                variant="unstyled"
                _focus={{ outline: "none" }}
                onClick={() => handleRemoveTag(tag.key)}
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
