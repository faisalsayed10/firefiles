import { motion } from "framer-motion";
import useAnimateOnInView from "../hooks/useAnimateOnInView";

const highlightVariant = {
	visible: { opacity: 1, transition: { duration: 0.5, delay: 0.5 } },
	hidden: { opacity: 0 },
};

const Highlights = () => {
	const { ref: ref1, controls: controls1 } = useAnimateOnInView();
	const { ref: ref2, controls: controls2 } = useAnimateOnInView();
	const { ref: ref3, controls: controls3 } = useAnimateOnInView();

	return (
		<div className="mt-20 overflow-hidden">
			<div className="flex items-center flex-col sm:flex-row justify-between">
				<div className="flex-[2] p-10">
					<div className="max-w-sm m-auto">
						<h1 className="text-4xl font-bold mb-10">No limits</h1>
						<p className="text-2xl text-gray-400">
							Easily manage multiple drives simultaneously through the dashboard and create more
							drives if you like.
						</p>
					</div>
				</div>
				<div
					ref={ref1}
					className="relative flex-[3] floss rounded-md sm:rounded-3xl w-[90%] min-h-[360px] sm:h-[700px] sm:w-full sm:left-14"
				>
					<motion.img
						src="/highlight-1.png"
						className="absolute top-[50%] left-[50%] sm:left-auto -translate-y-1/2 -translate-x-1/2 sm:translate-x-0 w-[90%] sm:w-auto max-h-[500px] sm:ml-10 rounded-md"
						alt="Easily manage multiple buckets"
						animate={controls1}
						initial="hidden"
						variants={highlightVariant}
					/>
				</div>
			</div>
			<div className="flex items-center flex-col sm:flex-row-reverse justify-between mt-20">
				<div className="flex-[2] p-10">
					<div className="max-w-sm m-auto">
						<h1 className="text-4xl font-bold mb-10">Seamlessly upload and download</h1>
						<p className="text-2xl text-gray-400">
							Easily upload multiple files simultaneously & quickly and download them in a single
							click, whenever you want.
						</p>
					</div>
				</div>
				<div
					ref={ref2}
					className="relative flex-[3] blossom rounded-md sm:rounded-3xl w-[90%] min-h-[360px] sm:h-[700px] sm:w-full sm:right-14"
				>
					<motion.video
						src="/highlight-2.mov"
						autoPlay
						loop
						muted
						playsInline
						className="absolute top-[50%] right-[50%] sm:right-auto -translate-y-1/2 translate-x-1/2 sm:translate-x-0 w-[90%] sm:w-auto max-h-[500px] sm:-ml-10 rounded-md"
						animate={controls2}
						initial="hidden"
						variants={highlightVariant}
					/>
				</div>
			</div>
			<div className="flex items-center flex-col sm:flex-row justify-between mt-20">
				<div className="flex-[2] p-10">
					<div className="max-w-sm m-auto">
						<h1 className="text-4xl font-bold mb-10">File previews</h1>
						<p className="text-2xl text-gray-400">
							Preview all your files directly in the browser without downloading anything.
						</p>
					</div>
				</div>
				<div
					ref={ref3}
					className="relative flex-[3] glass-rainbow rounded-md sm:rounded-3xl w-[90%] min-h-[360px] sm:h-[700px] sm:w-full sm:left-14"
				>
					<motion.video
						src="/highlight-3.mov"
						autoPlay
						loop
						muted
						playsInline
						className="absolute top-[50%] left-[50%] sm:left-auto -translate-y-1/2 -translate-x-1/2 sm:translate-x-0 w-[95%] sm:w-auto max-h-[500px] sm:ml-10 rounded-md"
						animate={controls3}
						initial="hidden"
						variants={highlightVariant}
					/>
				</div>
			</div>
		</div>
	);
};

export default Highlights;
