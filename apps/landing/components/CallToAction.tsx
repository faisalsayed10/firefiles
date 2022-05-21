import { BrandOpenSource } from "tabler-icons-react";

const CallToAction = () => {
	return (
		<div className="flex relative items-center my-20 flex-col mx-5">
			<img src="/logo.png" className="w-40 h-40 mb-12 rounded-md" />
			<h1 className="font-black text-5xl max-w-3xl text-center mb-6">
				Get started with Firefiles today.
			</h1>
			<p className="text-xl text-center max-w-3xl text-gray-400 mb-10">
				Firefiles turns your storage buckets into cloud drives and lets you manage all your storage
				buckets at one place.
			</p>
			<div className="flex sm:flex-row flex-col justify-center gap-5 z-10">
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
				<a
					href="/docs/self-host"
					className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white border border-indigo-500 rounded-lg shadow-sm cursor-pointer bg-gradient-to-br from-purple-500 via-indigo-500 to-indigo-500"
				>
					<BrandOpenSource className="mr-2" />
					<span className="relative">Self Host</span>
				</a>
			</div>
		</div>
	);
};

export default CallToAction;
