import useUser from "@hooks/useUser";
import { useRouter } from "next/router";
import { ArrowNarrowLeft } from "tabler-icons-react";

export default function Navbar() {
	const { mutateUser } = useUser();
	const router = useRouter();

	return (
		<div className="flex items-center justify-between w-full h-16 px-4 bg-white border-b border-gray-200">
			{router.route !== "/" ? (
				<button onClick={() => router.push("/")}>
					<ArrowNarrowLeft /> Dashboard
				</button>
			) : null}
			<div>
				{/* <IconButton
						aria-label="toggle color theme"
						size="md"
						variant="ghost"
						_focus={{ outline: "none" }}
						onClick={toggleColorMode}
						icon={colorMode === "light" ? <Moon size="16" /> : <Sun size="16" />}
					/> */}
				{/* <Menu>
						<MenuButton size="sm" as={Button} variant="ghost" rightIcon={<ChevronDown size="16" />}>
							Actions
						</MenuButton>
						<MenuList>
							<MenuItem
								icon={<File />}
								onClick={() => window.open("https://firefiles.app/docs", "_blank")}
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
									await axios.get("/api/auth/logout");
									mutateUser(null, false);
									router.push("/login");
								}}
							>
								Log Out
							</MenuItem>
						</MenuList>
					</Menu> */}
			</div>
		</div>
	);
}
