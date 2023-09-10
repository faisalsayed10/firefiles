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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { X, Plus, Check, Edit, DotsVertical, Minus } from "tabler-icons-react";
import { DriveFile, Tag } from "@util/types";
import useBucket from "@hooks/useBucket";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: DriveFile;
}

const TagsPopup: React.FC<Props> = ({ isOpen, onClose, file }) => {
  const { listTags, addTags, editTags, removeTags } = useBucket();
  const [tags, setTags] = useState<Tag[]>([]);
  const [addingTag, setAddingTag] = useState(false);
  const [tagBeingEdited, setTagBeingEdited] = useState<Tag | null>(null);
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");
  const [editedTag, setEditedTag] = useState<Tag | null>(null);

  const getTags = async () => {
    const tagList = await listTags(file);
    if (tagList) {
      setTags(tagList);
    } else {
      setTags([]);
    }
  };

  const handleAddTag = () => {
    setAddingTag(true);
  };

  const handleSaveTag = async () => {
    if (await addTags(file, newTagKey, newTagValue)) {
      await getTags();
      setNewTagKey("");
      setNewTagValue("");
      setAddingTag(false);
      toast.success(`Tag successfully added.`);
    }
  };

  const handleCancelTag = () => {
    setNewTagKey("");
    setNewTagValue("");
    setAddingTag(false);
  };

  const handleEditTag = async (tag: Tag) => {
    if (await editTags(file, tag, editedTag)) {
      setTagBeingEdited(null);
      setEditedTag(null);
      toast.success(`Tag successfully edited.`);
    }
    // rerender outside if in case tag needed to be removed and added again while editing
    await getTags();
  };

  const handleRemoveTag = async (key: string) => {
    if (await removeTags(file, key)) {
      await getTags();
      setTagBeingEdited(null);
      toast.success(`Tag successfully deleted.`);
    }
  };

  // load tags on first render
  useEffect(() => {
    getTags();
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent p="0">
        <Flex align="center" justify="space-between" p="4">
          <Text fontSize="2xl" fontWeight="600" overflow="hidden">
            Tags for {file.name}
          </Text>
          <ModalCloseButton size="md" />
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
            <Flex key={tag.key} mb="2" align="center">
              {/*change interface if editing tag*/}
              {tagBeingEdited === tag ? (
                <>
                  <Input
                    flex="1"
                    value={editedTag?.key ?? tag.key}
                    onChange={(e) =>
                      setEditedTag((prevTag) => ({ ...prevTag, key: e.target.value }))
                    }
                  />
                  <Input
                    flex="1"
                    ml="2"
                    value={editedTag?.value ?? tag.value}
                    onChange={(e) =>
                      setEditedTag((prevTag) => ({ ...prevTag, value: e.target.value }))
                    }
                  />
                  <IconButton
                    aria-label="Cancel"
                    icon={<X width={38} />}
                    variant="unstyled"
                    _focus={{ outline: "none" }}
                    onClick={() => setTagBeingEdited(null)}
                    _hover={{ bg: "hsl(60, 0%, 95%)" }}
                  />
                  <IconButton
                    aria-label="Save Tag"
                    icon={<Check width={38} />}
                    variant="unstyled"
                    _focus={{ outline: "none" }}
                    onClick={() => handleEditTag(tag)}
                    _hover={{ bg: "hsl(60, 0%, 95%)" }}
                  />
                </>
              ) : (
                <>
                  <Text flex="1" overflow="hidden">
                    {tag.key}
                  </Text>
                  <Text flex="1" ml="4" overflow="hidden">
                    {tag.value}
                  </Text>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Tag Options"
                      icon={<DotsVertical width={38} />}
                      variant="unstyled"
                      _hover={{ bg: "hsl(60, 0%, 95%)" }}
                    />
                    <MenuList>
                      <MenuItem
                        icon={<Edit width={38} />}
                        onClick={() => {
                          setTagBeingEdited(tag);
                          setEditedTag(tag);
                        }}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={<Minus width={38} />}
                        onClick={() => handleRemoveTag(tag.key)}
                      >
                        Remove
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </>
              )}
            </Flex>
          ))}
          {/*change interface if adding tag*/}
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
                icon={<X width={38} />}
                variant="unstyled"
                _focus={{ outline: "none" }}
                onClick={handleCancelTag}
                _hover={{ bg: "hsl(60, 0%, 95%)" }}
              />
              <IconButton
                aria-label="Save Tag"
                icon={<Check width={38} />}
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
                icon={<Plus width={38} />}
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
