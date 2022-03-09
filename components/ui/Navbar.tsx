import {
	Box,
	Button,
	Divider,
	Flex,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Tooltip,
	useColorMode,
} from "@chakra-ui/react";
import {
	faArrowCircleLeft,
	faChevronDown,
	faDonate,
	faFile,
	faMoon,
	faSignOutAlt,
	faSun,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useUser from "@hooks/useUser";
import { onLogout } from "@util/helpers";
import { useRouter } from "next/router";
import React from "react";

export default function Navbar() {
	const { colorMode, toggleColorMode } = useColorMode();
	const { logout } = useUser();
	const router = useRouter();

	return (
		<>
			<Flex
				align="center"
				justify={router.route !== "/" ? "space-between" : "end"}
				px="4"
				mt="2"
				boxShadow="sm"
				w="full"
			>
				{router.route !== "/" ? (
					<Button
						variant="link"
						leftIcon={<FontAwesomeIcon icon={faArrowCircleLeft} />}
						fontWeight="bold"
						onClick={() => router.push("/")}
					>
						Dashboard
					</Button>
				) : null}
				<Box mb="2">
					<TooltipButton
						icon={<FontAwesomeIcon icon={colorMode === "light" ? faMoon : faSun} />}
						label="Toggle dark mode"
						onClick={toggleColorMode}
					/>
					<Menu>
						<MenuButton
							h="50"
							as={Button}
							variant="ghost"
							rightIcon={<FontAwesomeIcon icon={faChevronDown} />}
						>
							Actions
						</MenuButton>
						<MenuList>
							<MenuItem
								icon={<FontAwesomeIcon icon={faFile} />}
								onClick={() => window.open("https://firefiles.vercel.app/docs", "_blank")}
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
							<MenuItem
								icon={<FontAwesomeIcon icon={faSignOutAlt} />}
								onClick={async () => {
									await onLogout();
									await logout();
								}}
							>
								Log Out
							</MenuItem>
						</MenuList>
					</Menu>
				</Box>
			</Flex>
			<Divider />
		</>
	);
}

const TooltipButton = ({ label, onClick, icon }) => (
	<Tooltip label={label} hasArrow>
		<Button
			w="50px"
			h="50px"
			variant="outline"
			_focus={{ outline: "none" }}
			mr="2"
			onClick={onClick}
		>
			{icon}
		</Button>
	</Tooltip>
);
