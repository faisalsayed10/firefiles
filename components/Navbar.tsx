import { Box, Button, Flex, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { faMoon, faSignOutAlt, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useUser from "@util/useUser";
import React from "react";

export default function Navbar() {
	const { colorMode, toggleColorMode } = useColorMode();
	const { logout } = useUser();

	return (
		<Flex align="center" justify="end" mx="2rem" mt="2">
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
					onClick={logout}
				>
					<FontAwesomeIcon icon={faSignOutAlt} />
				</Button>
			</Box>
		</Flex>
	);
}
