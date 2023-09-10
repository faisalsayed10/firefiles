import { IconButton, Td, Tr, Tooltip } from "@chakra-ui/react";
import { Role } from "@prisma/client";
import { download } from "@util/helpers";
import { DriveFile } from "@util/types";
import { RoleContext } from "pages/drives/[id]";
import prettyBytes from "pretty-bytes";
import { Copy, FileDownload, FileMinus, Tags, TagsOff } from "tabler-icons-react";
import React, { useContext, useState } from "react";
import FileIcon from "./FileIcon";
import TagsPopup from "../popups/TagsPopup";
import useBucket from "@hooks/useBucket";
import toast from "react-hot-toast";

interface Props {
  file: DriveFile;
  onPreviewOpen: () => void;
  copyFile: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  onTagsOpen: () => void;
}

const FileRow: React.FC<Props> = (props) => {
  const [isTagsOpen, setIsTagsOpen] = React.useState(false);
  const { enableTags } = useBucket();
  const role = useContext(RoleContext);

  const onTagsOpen = () => {
    setIsTagsOpen(true);
  };

  const onTagsClose = () => {
    setIsTagsOpen(false);
  };

  return (
    <>
      <Tr>
        <Td maxW="36px">
          <FileIcon extension={props.file.name.split(".").pop()} id={props.id} />
        </Td>
        <Td
          fontWeight="medium"
          isTruncated
          maxW={["250px", "300px", "300px"]}
          onClick={props.onPreviewOpen}
          textDecor="underline"
          cursor="pointer"
          _hover={{ textDecor: "none" }}
        >
          {props.file.name}
        </Td>
        <Td minW="110px">{props.file.size && prettyBytes(parseInt(props.file.size) || 0)}</Td>
        <Td textAlign="center">
          <IconButton
            aria-label="Copy file URL"
            icon={<Copy />}
            onClick={props.copyFile}
            isLoading={!props.file.url}
            variant="outline"
            colorScheme="blue"
          />
        </Td>
        <Td textAlign="center">
          <IconButton
            aria-label="Download file"
            icon={<FileDownload />}
            isLoading={!props.file.url}
            variant="outline"
            colorScheme="blue"
            onClick={() => download(props.file)}
          />
        </Td>
        <Td textAlign="center">
          {role === Role.VIEWER ? (
            <Tooltip label="You don't have delete permissions as a Viewer">
              <span>
                <IconButton
                  disabled
                  aria-label="Delete file"
                  icon={<FileMinus />}
                  variant="outline"
                  colorScheme="red"
                />
              </span>
            </Tooltip>
          ) : (
            <IconButton
              aria-label="Delete file"
              icon={<FileMinus />}
              onClick={() => props.setIsOpen(true)}
              variant="outline"
              colorScheme="red"
            />
          )}
        </Td>
        {/*disable tags depending on provider*/}
        {enableTags ? (
          <Td textAlign="center">
            <IconButton
              aria-label="Tags"
              icon={<Tags />}
              onClick={onTagsOpen}
              variant="outline"
              colorScheme="black"
            />
          </Td>
        ) : (
          <Td textAlign="center">
            <IconButton
              aria-label="Tags"
              icon={<TagsOff color={"gray"} />}
              onClick={() => {
                toast.error("Tags not supported for this provider.");
              }}
              variant="outline"
              colorScheme="gray"
            />
          </Td>
        )}
      </Tr>
      <TagsPopup isOpen={isTagsOpen} onClose={onTagsClose} file={props.file} />
    </>
  );
};

export default FileRow;
