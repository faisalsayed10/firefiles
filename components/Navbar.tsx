import { Box, Button, Flex, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function Navbar() {
	const { colorMode, toggleColorMode } = useColorMode();

	return (
		<Flex align="center" justify="space-between" mx="2rem" mt="2">
			<Box w="50px" h="50px" />
			<Text align="center" fontSize="3xl">
				Your Drive
			</Text>
			<Button
				w="50px"
				h="50px"
				variant="solid"
				_focus={{ outline: "none" }}
				bgColor={useColorModeValue("white", "#1a202c")}
				onClick={toggleColorMode}
			>
				<FontAwesomeIcon icon={colorMode === "light" ? faMoon : faSun} />
			</Button>
		</Flex>
	);
}
