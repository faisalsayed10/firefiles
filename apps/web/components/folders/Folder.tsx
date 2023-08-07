import { Flex, MenuDivider, Text, useColorModeValue } from "@chakra-ui/react";
import OptionsPopover from "@components/popups/OptionsPopover";
import useBucket from "@hooks/useBucket";
import useKeys from "@hooks/useKeys";
import { Role } from "@prisma/client";
import { DriveFolder, Provider } from "@util/types";
import { useRouter } from "next/router";
import { RoleContext } from "pages/drives/[id]";
import React, { useContext, useRef, useState } from "react";
import { ExternalLink, Folder as FolderIcon, FolderMinus, Plus } from "tabler-icons-react";
import DeleteAlert from "../popups/DeleteAlert";

interface Props {
  folder: DriveFolder;
  setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
}

const Folder: React.FC<Props> = ({ folder, setIsFolderDeleting }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const router = useRouter();
  const cancelRef = useRef();
  const { removeFolder } = useBucket();
  const role = useContext(RoleContext);

  const optionProps = {
    p: 2,
    cursor: "pointer",
    _hover: { backgroundColor: useColorModeValue("gray.100", "rgba(237, 242, 247, 0.1)") },
  };

  return (
    <>
      <DeleteAlert
        role={role}
        cancelRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        onClick={async () => {
          try {
            setIsFolderDeleting(true);
            onClose();
            await removeFolder(folder);
          } catch (err) {
            console.error(err);
          } finally {
            setIsFolderDeleting(false);
          }
        }}
      />
      <Flex
        cursor="pointer"
        direction="column"
        align="center"
        borderRadius="lg"
        boxShadow="5.5px 4.2px 7.8px -1.7px rgba(0, 0, 0, 0.1)"
        w={["140px", "180px", "180px"]}
        h="140px"
        borderWidth="1px"
        transition="ease-in-out 0.1s"
        className="hoverAnim"
      >
        <FolderIcon
          onClick={() => router.push(`${router.asPath}/${folder.name}`)}
          style={{ flex: 1, strokeWidth: "1px", color: useColorModeValue("#2D3748", "white") }}
          size={72}
        />
        <Flex p="2" w="inherit" justify="space-between" alignItems="center">
          <Text
            onClick={() => router.push(`${router.asPath}/${folder.name}`)}
            flex="1"
            isTruncated={true}
            maxW="150px"
            as="p"
            fontSize="xs"
            align="left"
            px="2"
          >
            {folder.name}
          </Text>
          <OptionsPopover header={folder.name}>
            <Flex alignItems="stretch" flexDirection="column">
              <Flex {...optionProps} onClick={() => router.push(`${router.asPath}/${folder.name}`)}>
                <Plus />
                <Text ml="2">Open</Text>
              </Flex>
              <MenuDivider />
              <Flex
                {...optionProps}
                onClick={() => window.open(`${router.asPath}/${folder.name}`, "_blank")}
              >
                <ExternalLink />
                <Text ml="2">Open in new tab</Text>
              </Flex>
              <MenuDivider />
              {role === Role.VIEWER || (
                <Flex {...optionProps} onClick={() => setIsOpen(true)}>
                  <FolderMinus />
                  <Text ml="2">Delete Folder</Text>
                </Flex>
              )}
            </Flex>
          </OptionsPopover>
        </Flex>
      </Flex>
    </>
  );
};

export default Folder;
