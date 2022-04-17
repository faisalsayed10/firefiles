import {
	Box,
	Button,
	Divider,
	Flex,
	IconButton,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Tooltip,
	useColorMode
} from "@chakra-ui/react";
import useUser from "@hooks/useUser";
import { onLogout } from "@util/helpers";
import { useRouter } from "next/router";
import React from "react";
import { ArrowNarrowLeft, ChevronDown, Coin, File, Logout, Moon, Sun } from "tabler-icons-react";

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
						leftIcon={<ArrowNarrowLeft />}
						fontWeight="bold"
						onClick={() => router.push("/")}
					>
						Dashboard
					</Button>
				) : null}
				<Box mb="2">
					<TooltipButton
						icon={colorMode === "light" ? <Moon /> : <Sun />}
						label="Toggle dark mode"
						onClick={toggleColorMode}
					/>
					<Menu>
						<MenuButton h="50" as={Button} variant="ghost" rightIcon={<ChevronDown />}>
							Actions
						</MenuButton>
						<MenuList>
							<MenuItem
								icon={<File />}
								onClick={() => window.open("https://firefiles.vercel.app/docs", "_blank")}
							>
								View Documentation
							</MenuItem>
							<MenuItem
								icon={<Coin />}
								onClick={() => {
									const url = "https://github.com/faisalsayed10/firefiles#sponsor-this-project";
									window.open(url, "_blank");
								}}
							>
								Donate Us
							</MenuItem>
							<MenuItem
								icon={<Logout />}
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
		<IconButton
			aria-label="icon button"
			w="50px"
			h="50px"
			variant="outline"
			_focus={{ outline: "none" }}
			mr="2"
			onClick={onClick}
			icon={icon}
		/>
	</Tooltip>
);
