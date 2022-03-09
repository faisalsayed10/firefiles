import {
        Flex,
        MenuItem,
        Box,
        MenuList,
        Text,
        useColorModeValue,
        Popover,
        Button,
        PopoverArrow,
        PopoverBody,
        PopoverCloseButton,
        PopoverContent,
        PopoverFooter,
        PopoverHeader,
        PopoverTrigger,
        Portal
} from '@chakra-ui/react';
import {
        deleteObject,
        getStorage,
        listAll,
        ref,
        StorageReference
} from '@firebase/storage';
import {
        faExternalLinkAlt,
        faFolderOpen,
        faPlus,
        faEllipsisH,
        faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useFirebase from '@hooks/useFirebase';
import { sendEvent } from '@util/firebase';
import { ContextMenu } from 'chakra-ui-contextmenu';
import router, { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import DeleteAlert from '../popups/DeleteAlert';

interface Props {
        folder: StorageReference;
        setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
        bigIcon?: boolean;
}

const deleteLocalFolder = (folder: StorageReference) => {
        const id = router.asPath.split('/')[2];
        const localFolders = localStorage.getItem(`local_folders_${id}`);
        if (localFolders) {
                const folders = JSON.parse(localFolders);
                const filtered = folders.filter(
                        (f) => !f.fullPath.includes(folder.fullPath)
                );
                localStorage.setItem(
                        `local_folders_${id}`,
                        JSON.stringify(filtered)
                );
        }
};

const recursiveDelete = async (
        folders: StorageReference[],
        files: StorageReference[]
) => {
        for (const file of files) {
                deleteObject(file);
        }
        if (!folders || folders.length < 1) {
                return;
        } else {
                for (const folder of folders) {
                        const subFolders = await listAll(folder);
                        return recursiveDelete(
                                subFolders.prefixes,
                                subFolders.items
                        );
                }
        }
};

const Folder: React.FC<Props> = ({
        folder,
        setIsFolderDeleting,
        bigIcon = false
}) => {
        const [isOpen, setIsOpen] = useState(false);
        const onClose = () => setIsOpen(false);
        const router = useRouter();
        const cancelRef = useRef();
        const { app, removeFolder } = useFirebase();

        return (
                <>
                        <DeleteAlert
                                cancelRef={cancelRef}
                                onClose={onClose}
                                isOpen={isOpen}
                                onClick={async () => {
                                        try {
                                                if (!app) return;
                                                const storage = getStorage(app);

                                                setIsFolderDeleting(true);
                                                onClose();
                                                const currentRef = ref(
                                                        storage,
                                                        decodeURIComponent(
                                                                folder.fullPath
                                                        ) + '/'
                                                );
                                                const res = await listAll(
                                                        currentRef
                                                );

                                                removeFolder(folder);
                                                deleteLocalFolder(folder);
                                                recursiveDelete(
                                                        res.prefixes,
                                                        res.items
                                                );
                                                sendEvent('folder_delete', {});
                                        } catch (err) {
                                                console.error(err);
                                        } finally {
                                                setIsFolderDeleting(false);
                                        }
                                }}
                        />
                        <Flex
                                direction="column"
                                align="center"
                                justify="space-between"
                                boxShadow="5.5px 4.2px 7.8px -1.7px rgba(0, 0, 0, 0.1)"
                                w="100%"
                                h="100%"
                        >
                                <Flex
                                        ml="1"
                                        textAlign="center"
                                        justify="center"
                                        alignItems="center"
                                        objectFit="cover"
                                        h="100%"
                                        w="100%"
                                        cursor="pointer"
                                        onClick={() =>
                                                router.push(
                                                        `${router.asPath}/${folder.name}`
                                                )
                                        }
                                >
                                        <FontAwesomeIcon
                                                icon={faFolderOpen}
                                                size={bigIcon ? '3x' : '3x'}
                                                color={useColorModeValue(
                                                        '#2D3748',
                                                        'white'
                                                )}
                                        />
                                </Flex>
                                <Flex
                                        p="2"
                                        w="100%"
                                        justify="space-between"
                                        alignItems="center"
                                >
                                        <Text
                                                isTruncated={true}
                                                as="p"
                                                fontSize="xs"
                                                align="center"
                                                px="2"
                                                maxW="105px"
                                                onClick={() =>
                                                        router.push(
                                                                `${router.asPath}/${folder.name}`
                                                        )
                                                }
                                        >
                                                {folder.name}
                                        </Text>
                                        <Popover>
                                                <PopoverTrigger>
                                                        <Box as="button">
                                                                <FontAwesomeIcon
                                                                        icon={
                                                                                faEllipsisH
                                                                        }
                                                                />
                                                        </Box>
                                                </PopoverTrigger>
                                                <Portal>
                                                        <PopoverContent w="250px">
                                                                <PopoverArrow />
                                                                <PopoverHeader>
                                                                        <Text
                                                                                fontSize="sm"
                                                                                maxW="150px"
                                                                                fontStyle="bold"
                                                                                isTruncated={
                                                                                        true
                                                                                }
                                                                        >
                                                                                {
                                                                                        folder.name
                                                                                }
                                                                        </Text>
                                                                </PopoverHeader>
                                                                <PopoverCloseButton mt="0.5" />
                                                                <PopoverBody
                                                                        my="-2"
                                                                        mx="-3"
                                                                >
                                                                        <Flex
                                                                                alignItems="start"
                                                                                flexDirection="column"
                                                                        >
                                                                                <Box
                                                                                        as="button"
                                                                                        py="2"
                                                                                        px="4"
                                                                                        w="100%"
                                                                                        textAlign="left"
                                                                                        onClick={() =>
                                                                                                router.push(
                                                                                                        `${router.asPath}/${folder.name}`
                                                                                                )
                                                                                        }
                                                                                        _hover={{
                                                                                                backgroundColor:
                                                                                                        'gray.600'
                                                                                        }}
                                                                                >
                                                                                        <FontAwesomeIcon
                                                                                                style={{
                                                                                                        marginRight:
                                                                                                                '10px'
                                                                                                }}
                                                                                                icon={
                                                                                                        faPlus
                                                                                                }
                                                                                        />
                                                                                        Open
                                                                                </Box>
                                                                                <Box
                                                                                        as="button"
                                                                                        py="2"
                                                                                        px="4"
                                                                                        w="100%"
                                                                                        textAlign="left"
                                                                                        onClick={() =>
                                                                                                window.open(
                                                                                                        `${router.asPath}/${folder.name}`,
                                                                                                        '_blank'
                                                                                                )
                                                                                        }
                                                                                        _hover={{
                                                                                                backgroundColor:
                                                                                                        'gray.600'
                                                                                        }}
                                                                                >
                                                                                        <FontAwesomeIcon
                                                                                                style={{
                                                                                                        marginRight:
                                                                                                                '10px'
                                                                                                }}
                                                                                                icon={
                                                                                                        faExternalLinkAlt
                                                                                                }
                                                                                        />
                                                                                        Open
                                                                                        in
                                                                                        new
                                                                                        tab
                                                                                </Box>
                                                                                <Box
                                                                                        as="button"
                                                                                        py="2"
                                                                                        px="4"
                                                                                        w="100%"
                                                                                        textAlign="left"
                                                                                        onClick={() =>
                                                                                                setIsOpen(
                                                                                                        true
                                                                                                )
                                                                                        }
                                                                                        _hover={{
                                                                                                backgroundColor:
                                                                                                        'gray.600'
                                                                                        }}
                                                                                >
                                                                                        <FontAwesomeIcon
                                                                                                style={{
                                                                                                        marginRight:
                                                                                                                '10px'
                                                                                                }}
                                                                                                icon={
                                                                                                        faTrash
                                                                                                }
                                                                                        />
                                                                                        Delete
                                                                                        Folder
                                                                                </Box>
                                                                        </Flex>
                                                                </PopoverBody>
                                                        </PopoverContent>
                                                </Portal>
                                        </Popover>
                                </Flex>
                        </Flex>
                </>
        );
};

export default Folder;
