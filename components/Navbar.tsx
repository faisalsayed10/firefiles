import { Box, Button, Flex, Tooltip, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { faDonate, faMoon, faSignOutAlt, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useUser from "@util/useUser";
import React from "react";

export default function Navbar() {
	const { colorMode, toggleColorMode } = useColorMode();
	const { logout } = useUser();

	return (
		<Flex align="center" justify="end" mx="2rem" mt="2">
			<Box>
				<TooltipButton
					icon={<FontAwesomeIcon icon={colorMode === "light" ? faMoon : faSun} />}
					label="Toggle dark mode"
					onClick={toggleColorMode}
				/>
				<TooltipButton
					icon={<FontAwesomeIcon icon={faDonate} />}
					label="Sponsor this project"
					onClick={() => {
						const url = "https://github.com/faisalsayed10/firefiles#sponsor-this-project";
						window.open(url, "_blank");
					}}
				/>
				<TooltipButton
					icon={<FontAwesomeIcon icon={faSignOutAlt} />}
					label="Logout"
					onClick={logout}
				/>
			</Box>
		</Flex>
	);
}

const TooltipButton = ({ label, onClick, icon }) => (
	<Tooltip label={label} hasArrow>
		<Button
			w="50px"
			h="50px"
			variant="solid"
			_focus={{ outline: "none" }}
			bgColor={useColorModeValue("white", "#1a202c")}
			onClick={onClick}
		>
			{icon}
		</Button>
	</Tooltip>
);
