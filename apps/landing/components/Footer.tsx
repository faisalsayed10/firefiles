import { BrandDiscord, BrandGithub, BrandTwitter, Coin } from "tabler-icons-react";

const Footer = () => {
	return (
		<footer className="text-gray-400 bg-gray-900 body-font relative z-10">
			<div className="container px-5 py-24 mx-auto flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
				<div className="w-64 flex-sh`	rink-0 md:mx-0 mx-auto text-center md:text-left">
					<a className="flex title-font font-medium items-center md:justify-start justify-center text-white">
						<img src="/logo.png" className="w-10 h-10" />
						<span className="ml-3 text-xl">Firefiles</span>
					</a>
					<p className="mt-2 text-sm text-gray-500">© Copyright 2022 Faisal Sayed</p>
					<span className="inline-flex mt-5 justify-center sm:justify-start">
						<a className="text-gray-400 hover:text-white" href="https://twitter.com/tryfirefiles">
							<BrandTwitter />
						</a>
						<a className="ml-3 text-gray-400 hover:text-white" href="https://discord.com">
							<BrandDiscord />
						</a>
						<a
							className="ml-3 text-gray-400 hover:text-white"
							href="https://github.com/faisalsayed10/firefiles"
						>
							<BrandGithub />
						</a>
						<a
							className="ml-3 text-gray-400 hover:text-white"
							href="https://opencollective.com/faisalsayed10/projects/firefiles"
						>
							<Coin />
						</a>
					</span>
				</div>
				<div className="flex-grow flex flex-wrap md:pl-20 -mb-10 md:mt-0 mt-10 md:text-left text-center">
					<div className="lg:w-1/4 md:w-1/2 w-full px-4">
						<h2 className="title-font font-medium text-white tracking-widest text-sm mb-3">
							ABOUT
						</h2>
						<nav className="list-none mb-10">
							<li>
								<a
									className="text-gray-400 hover:text-white"
									href="https://github.com/faisalsayed10"
								>
									Team
								</a>
							</li>
							<li>
								<a className="text-gray-400 hover:text-white" href="/faq">
									FAQ
								</a>
							</li>
							<li>
								<a
									className="text-gray-400 hover:text-white"
									href="https://github.com/faisalsayed10/firefiles/releases"
								>
									Changelog
								</a>
							</li>
						</nav>
					</div>
					<div className="lg:w-1/4 md:w-1/2 w-full px-4">
						<h2 className="title-font font-medium text-white tracking-widest text-sm mb-3">
							DOWNLOADS
						</h2>
						<nav className="list-none mb-10">
							<li>
								<a className="text-gray-700">MacOS</a>
							</li>
							<li>
								<a className="text-gray-700">Windows</a>
							</li>
							<li>
								<a className="text-gray-700">Linux</a>
							</li>
						</nav>
					</div>
					<div className="lg:w-1/4 md:w-1/2 w-full px-4">
						<h2 className="title-font font-medium text-white tracking-widest text-sm mb-3">
							DEVELOPERS
						</h2>
						<nav className="list-none mb-10">
							<li>
								<a className="text-gray-400 hover:text-white" href="/docs">
									Documentation
								</a>
							</li>
							<li>
								<a
									className="text-gray-400 hover:text-white"
									href="https://github.com/faisalsayed10/firefiles/blob/main/docs/CONTRIBUTING.md"
								>
									Contribute
								</a>
							</li>
							<li>
								<a className="text-gray-400 hover:text-white" href="/docs/self-host">
									Self Host
								</a>
							</li>
						</nav>
					</div>
					<div className="lg:w-1/4 md:w-1/2 w-full px-4">
						<h2 className="title-font font-medium text-white tracking-widest text-sm mb-3">ORG</h2>
						<nav className="list-none mb-10">
							<li>
								<a
									className="text-gray-400 hover:text-white"
									href="https://opencollective.com/faisalsayed10/projects/firefiles"
								>
									Sponsor Us
								</a>
							</li>
							<li>
								<a
									className="text-gray-400 hover:text-white"
									href="https://github.com/faisalsayed10/firefiles/blob/main/LICENSE"
								>
									License
								</a>
							</li>
							<li>
								<a className="text-gray-700">Privacy</a>
							</li>
							<li>
								<a className="text-gray-700">Terms</a>
							</li>
						</nav>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
