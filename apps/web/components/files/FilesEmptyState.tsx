import { Flex, Text } from "@chakra-ui/react";
import React from "react";

const FilesEmptyState = () => (
	<Flex
		p={["8", "16", "16"]}
		mx="4"
		borderWidth="1px"
		borderRadius="lg"
		justify="center"
		direction="column"
		align="center"
		textAlign="center"
	>
		<Text fontSize={["lg", "xl", "2xl"]} fontWeight="400" mb={8}>
			There aren't any files
		</Text>
		<Text fontSize={["sm", "sm", "md"]} fontWeight="400">
			Drop a file anywhere on the screen or click the button on the bottom right to upload a file.
		</Text>
	</Flex>
);

export default FilesEmptyState;
