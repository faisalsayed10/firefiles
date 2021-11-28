import { Text, Image, Box, useColorMode, Button } from "@chakra-ui/react";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
		<Box display="flex" alignItems="baseline" justifyContent="center">
			<Image
				width={["56px", "72px"]}
				src="/logo_48x48.png"
				alt="Angelfiles Logo"
				display="inline"
				mr="2"
			/>
			<Text fontSize={["2xl", "3xl"]}>Angelfiles</Text>
			<Button
				pos="absolute"
				width={["30px", "50px"]}
				height={["30px", "40px"]}
				variant="ghost"
				right="5%"
				top="14px"
				onClick={toggleColorMode}>
				<FontAwesomeIcon icon={colorMode === "light" ? faMoon : faSun} />
			</Button>
		</Box>
	);
}
