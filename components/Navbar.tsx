import { Box, Button, Flex, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { faMoon, faSignOutAlt, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React from "react";

export default function Navbar() {
	const { colorMode, toggleColorMode } = useColorMode();

	return (
		<Flex align="center" justify="space-between" mx="2rem" mt="2">
			<Box w="50px" h="50px" />
			<Text align="center" fontSize="3xl">
				Your Drive
			</Text>
			<Box>
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
				<Button
					w="50px"
					h="50px"
					variant="solid"
					_focus={{ outline: "none" }}
					bgColor={useColorModeValue("white", "#1a202c")}
					onClick={() => axios.get('/api/logout')}
				>
					<FontAwesomeIcon icon={faSignOutAlt} />
				</Button>
			</Box>
		</Flex>
	);
}
