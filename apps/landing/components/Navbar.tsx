import toast from "react-hot-toast";
import { BrandGithub, BrandTwitter, Businessplan } from "tabler-icons-react";

const Navbar = () => {
	return (
		<header className="sticky flex items-center justify-around top-0 z-50 bg-opacity-20 dark:bg-opacity-20 border-b bg-black border-white/10 backdrop-blur-md backdrop-saturate-200 h-20">
			<nav className="flex flex-col w-[90%] my-0 mx-auto p-2 text-center max-w-[1440px]">
				<div className="flex justify-between">
					<a href="/">
						<div className="flex flex-row items-center flex-none flex-nowrap font-medium text-xl mb-1 min-w-[60px] gap-2">
							<img src="/logo.png" alt="logo" className="h-10 w-10 rounded-md" />
							<span className="ml-1 text-white">Firefiles</span>
						</div>
					</a>
					<div className="hidden sm:flex items-center justify-evenly w-[60%]">
						<a
							className="text-sm text-[#ccc] hover:text-[#ecf0f1] transition duration-300"
							href="/docs"
						>
							Documentation
						</a>
						<a
							className="text-sm text-[#ccc] hover:text-[#ecf0f1] transition duration-300"
							href="#features"
						>
							Features
						</a>
						<a
							className="text-sm text-[#ccc] hover:text-[#ecf0f1] transition duration-300"
							href="https://discord.com"
							target="_blank"
						>
							Community
						</a>
						<a
							className="text-sm text-[#ccc] hover:text-[#ecf0f1] transition duration-300 cursor-pointer"
							onClick={() =>
								toast("We're free until we figure out our pricing :p", { icon: <Businessplan /> })
							}
						>
							Pricing
						</a>
						<a
							className="text-sm text-[#ccc] hover:text-[#ecf0f1] transition duration-300"
							href="/faq"
						>
							FAQ
						</a>
					</div>
					<div className="flex items-center justify-between w-[60px]">
						<a
							href="https://twitter.com/tryfirefiles"
							className="text-sm text-[#ccc] hover:text-[#ecf0f1] transition duration-300"
						>
							<BrandTwitter />
						</a>
						<a
							href="https://github.com/faisalsayed10/firefiles"
							className="text-sm text-[#ccc] hover:text-[#ecf0f1] transition duration-300"
						>
							<BrandGithub />
						</a>
					</div>
				</div>
				<div className="flex sm:hidden items-center justify-between w-full mx-auto">
					<a
						className="text-sm text-[#ccc] hover:text-[#ecf0f1] transition duration-300"
						href="/docs"
					>
						Docs
					</a>
					<a
						className="text-sm text-[#ccc] hover:text-[#ecf0f1] transition duration-300"
						href="https://discord.com"
						target="_blank"
					>
						Community
					</a>
					<a
						className="text-sm text-[#ccc] hover:text-[#ecf0f1] transition duration-300 cursor-pointer"
						onClick={() =>
							toast("We're free until we figure out our pricing :p", { icon: <Businessplan /> })
						}
					>
						Pricing
					</a>
					<a
						className="text-sm text-[#ccc] hover:text-[#ecf0f1] transition duration-300"
						href="/faq"
					>
						FAQ
					</a>
				</div>
			</nav>
		</header>
	);
};

export default Navbar;
