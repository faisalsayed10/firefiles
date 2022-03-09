import { Box, Table, Th, Tr, Grid, GridItem } from '@chakra-ui/react';
import Folder from '@components/folders/Folder';
import { StorageReference } from 'firebase/storage';
import React, { useState } from 'react';
import File from './File';

interface Props {
        childFolders: StorageReference[];
        childFiles: StorageReference[];
        gridOn: boolean;
}

const FilesTable: React.FC<Props> = ({ childFolders, childFiles, gridOn }) => {
        const [isFolderDeleting, setIsFolderDeleting] = useState(false);
        return (
                <Box
                        borderWidth="1px"
                        borderRadius="lg"
                        overflowX="auto"
                        p="4"
                        mx="4"
                        mb="4"
                >
                        {gridOn ? (
                                <Grid
                                        templateColumns={[
                                                'repeat(2, 1fr)',
                                                'repeat(3, 1fr)',
                                                'repeat(4, 1fr)',
                                                'repeat(6, 1fr)',
                                                'repeat(7, 1fr)',
                                                'repeat(8, 1fr)'
                                        ]}
                                        gap={6}
                                >
                                        {childFolders.length > 0 &&
                                                childFolders.map(
                                                        (childFolder) => (
                                                                <GridItem
                                                                        w="100%"
                                                                        h="140px"
                                                                        borderWidth="1px"
                                                                        borderRadius="lg"
                                                                        boxShadow="5.5px 4.2px 7.8px -1.7px rgba(0, 0, 0, 0.05)"
                                                                >
                                                                        <Folder
                                                                                bigIcon={
                                                                                        true
                                                                                }
                                                                                setIsFolderDeleting={
                                                                                        setIsFolderDeleting
                                                                                }
                                                                                folder={
                                                                                        childFolder
                                                                                }
                                                                        />
                                                                </GridItem>
                                                        )
                                                )}
                                        {childFiles.length > 0 &&
                                                childFiles.map((childFile) => (
                                                        <GridItem
                                                                w="100%"
                                                                h="140px"
                                                                borderWidth="1px"
                                                                borderRadius="lg"
                                                                overflow="hidden"
                                                                boxShadow="5.5px 4.2px 7.8px -1.7px rgba(0, 0, 0, 0.05)"
                                                        >
                                                                <File
                                                                        file={
                                                                                childFile
                                                                        }
                                                                        bigIcon={
                                                                                true
                                                                        }
                                                                />
                                                        </GridItem>
                                                ))}
                                </Grid>
                        ) : (
                                <Table w="full">
                                        <thead>
                                                <Tr>
                                                        <Th></Th>
                                                        <Th>Name</Th>
                                                        <Th>Size</Th>
                                                        <Th textAlign="center">
                                                                Share
                                                        </Th>
                                                        <Th textAlign="center">
                                                                Download
                                                        </Th>
                                                        <Th textAlign="center">
                                                                Delete
                                                        </Th>
                                                </Tr>
                                        </thead>
                                        <tbody>
                                                {childFiles.length > 0 &&
                                                        childFiles.map(
                                                                (childFile) => (
                                                                        <File
                                                                                key={
                                                                                        childFile.name
                                                                                }
                                                                                file={
                                                                                        childFile
                                                                                }
                                                                        />
                                                                )
                                                        )}
                                        </tbody>
                                </Table>
                        )}
                </Box>
        );
};

export default FilesTable;
