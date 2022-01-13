import {
	Box,
	Button,
	Flex,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Tooltip,
	useColorMode
} from "@chakra-ui/react";
import {
	faChevronDown,
	faDonate,
	faFile,
	faMoon,
	faSignOutAlt,
	faSun
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useUser from "@hooks/useUser";
import React from "react";

export default function Navbar() {
	const { colorMode, toggleColorMode } = useColorMode();
	const { logout } = useUser();

	return (
		<Flex align="center" justify="end" px="2" mt="2" borderBottomWidth="1px" boxShadow="sm">
			<Box mb="2">
				<TooltipButton
					icon={<FontAwesomeIcon icon={colorMode === "light" ? faMoon : faSun} />}
					label="Toggle dark mode"
					onClick={toggleColorMode}
				/>
				<Menu>
					<MenuButton h="50" as={Button} rightIcon={<FontAwesomeIcon icon={faChevronDown} />}>
						Actions
					</MenuButton>
					<MenuList>
						<MenuItem
							icon={<FontAwesomeIcon icon={faFile} />}
							onClick={() => window.open("https://firefiles.vercel.app/docs/intro", "_blank")}
						>
							View Documentation
						</MenuItem>
						<MenuItem
							icon={<FontAwesomeIcon icon={faDonate} />}
							onClick={() => {
								const url = "https://github.com/faisalsayed10/firefiles#sponsor-this-project";
								window.open(url, "_blank");
							}}
						>
							Donate Us
						</MenuItem>
						<MenuItem icon={<FontAwesomeIcon icon={faSignOutAlt} />} onClick={logout}>
							Log Out
						</MenuItem>
					</MenuList>
				</Menu>
			</Box>
		</Flex>
	);
}

const TooltipButton = ({ label, onClick, icon }) => (
	<Tooltip label={label} hasArrow>
		<Button w="50px" h="50px" variant="solid" _focus={{ outline: "none" }} mr="2" onClick={onClick}>
			{icon}
		</Button>
	</Tooltip>
);
