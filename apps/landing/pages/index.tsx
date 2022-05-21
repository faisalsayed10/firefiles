import Head from "next/head";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import CallToAction from "../components/CallToAction";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Highlights from "../components/Highlights";
import Navbar from "../components/Navbar";
// import Pricing from "../components/Pricing";
import Providers from "../components/Providers";

export default function Home() {
	useEffect(() => {
		const styleTags = document.querySelectorAll("style");
		if (styleTags.length > 1) {
			styleTags[1].remove();
		}
	}, []);

	return (
		<div className="main bg-black text-white">
			<Head>
				<title>The Open Source Dropbox Alternative | Firefiles</title>
			</Head>
			<Navbar />
			<Hero />
			<Providers />
			<Features />
			<Highlights />
			{/* <Pricing /> */}
			<CallToAction />
			<Footer />
			<Toaster position="bottom-right" />
		</div>
	);
}
