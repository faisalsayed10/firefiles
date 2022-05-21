import { motion } from "framer-motion";

const Hero = () => {
	return (
		<div className="hero-main">
			<div className="flex min-h-screen relative items-center mt-40 mx-5 flex-col">
				<div className="blur-gradient -z-10" />
				<motion.h1
					initial={{ scale: 0.5, opacity: 0, skewX: "-5deg" }}
					animate={{ scale: 1, opacity: 1, skewX: "0deg" }}
					transition={{ duration: 0.7, ease: "backOut" }}
					className="font-black text-5xl sm:text-6xl max-w-2xl text-center mb-10"
				>
					The open&#8209;source alternative to Dropbox
				</motion.h1>
				<motion.p
					initial={{ scale: 0.5, opacity: 0, skewX: "-5deg" }}
					animate={{ scale: 1, opacity: 1, skewX: "0deg" }}
					transition={{ duration: 0.7, ease: "backOut" }}
					className="text-xl text-center max-w-2xl text-gray-400 z-10"
				>
					Firefiles lets you setup a cloud drive with the backend of your choice and lets you
					seamlessly manage your files across multiple providers.
				</motion.p>
				<motion.div
					initial={{ opacity: 0, translateY: 10 }}
					animate={{ opacity: 1, translateY: 0 }}
					transition={{ duration: 0.3, delay: 0 }}
					className="mt-5 sm:mt-8 mb-10 sm:flex sm:justify-center lg:justify-start z-10"
				>
					<a
						href="https://usefirefiles.vercel.app"
						className="px-7 py-3.5 rounded-lg relative group text-white font-medium inline-block"
					>
						<span className="absolute top-0 left-0 w-full h-full rounded-lg opacity-50 filter blur-sm bg-gradient-to-br from-purple-600 to-blue-500"></span>
						<span className="h-full w-full inset-0 absolute mt-0.5 ml-0.5 bg-gradient-to-br filter group-active:opacity-0 rounded-lg opacity-50 from-purple-600 to-blue-500"></span>
						<span className="absolute inset-0 w-full h-full transition-all duration-200 ease-out rounded-lg shadow-xl bg-gradient-to-br filter group-active:opacity-0 group-hover:blur-sm from-purple-600 to-blue-500"></span>
						<span className="absolute inset-0 w-full h-full transition duration-200 ease-out rounded-lg bg-gradient-to-br to-purple-600 from-blue-500"></span>
						<span className="relative text-lg">
							Sign up for free{" "}
							<svg
								className="w-4 h-4 ml-1 inline"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
									clipRule="evenodd"
								></path>
							</svg>
						</span>
					</a>
				</motion.div>
				<img src="/firefiles-demo3.png" className="w-[75%] rounded-md z-10 shadow-lg" />
				<div className="blur-gradient bottom-0 z-0"></div>
			</div>
		</div>
	);
};

export default Hero;
