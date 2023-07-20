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
  const [tags, setTags] = useState<{ key: string; value: string }[]>([]);
  const [addingTag, setAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<{ key: string; value: string } | null>(null);
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");
  const [editedTag, setEditedTag] = useState<{ key: string; value: string } | null>(null);

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

  const handleRemoveTag = async (key: string) => {
    if (await removeTags(file, key)) {
      await getTags();
      setEditingTag(null);
      toast.success(`Tag successfully deleted.`);
    }
  };

  useEffect(() => {
    getTags();
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent p="0">
        <Flex align="center" justify="space-between" p="4">
          <Text fontSize="2xl" fontWeight="600">
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
              {editingTag === tag ? (
                <>
                  <Input
                    flex="1"
                    value={editedTag?.key ?? tag.key}  
                    onChange={(e) => setEditedTag((prevTag) => ({ ...prevTag, key: e.target.value }))}
                  />
                  <Input
                    flex="1"
                    ml="2"
                    value={editedTag?.value ?? tag.value}  
                    onChange={(e) => setEditedTag((prevTag) => ({ ...prevTag, value: e.target.value }))}
                  />
                  <IconButton
                    aria-label="Cancel"
                    icon={<X width={38}/>}
                    variant="unstyled"
                    _focus={{ outline: "none" }}
                    onClick={() => setEditingTag(null)}
                    _hover={{ bg: "hsl(60, 0%, 95%)" }}
                  />
                  <IconButton
                    aria-label="Save Tag"
                    icon={<Check width={38}/>}
                    variant="unstyled"
                    _focus={{ outline: "none" }}
                    onClick={async () => {
                      // if (await addTags(file, editingTag.key, editingTag.value)) {
                      //   await removeTags(file, tag.key);
                      //   await getTags();
                      //   setEditingTag(null);
                      //   toast.success(`Tag successfully edited.`);
                      // }
                      if (editingTag.key !== tag.key) {
                        // Key has been changed, remove the old tag and add the new one
                        if (await addTags(file, editingTag.key, editingTag.value)) {
                          await removeTags(file, tag.key);
                          await getTags();
                          setEditingTag(null);
                          toast.success(`Tag successfully edited.`);
                        } 
                      } else {
                        // Key is unchanged, simply update the value
                        if (await addTags(file, editingTag.key, editingTag.value)) {
                          await getTags();
                          setEditingTag(null);
                          toast.success(`Tag successfully edited.`);
                        }
                      }
                    }}
                    _hover={{ bg: "hsl(60, 0%, 95%)" }}
                  />  
                </>
              ) : (
                <>
                  <Text flex="1">{tag.key}</Text>
                  <Text flex="1" ml="4">
                    {tag.value}
                  </Text>
                  <Menu>
                    <MenuButton as={IconButton} aria-label="Tag Options" icon={<DotsVertical width={38}/>} variant="unstyled" _hover={{ bg: "hsl(60, 0%, 95%)" }}/>
                    <MenuList>
                      <MenuItem icon={<Edit width={38}/>} onClick={() => setEditingTag(tag)}>
                        Edit
                      </MenuItem>
                      <MenuItem icon={<Minus width={38}/>} onClick={() => handleRemoveTag(tag.key)}>
                        Remove
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </>
              )}
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


