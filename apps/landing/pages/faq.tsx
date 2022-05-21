import { MarkdownPreviewProps } from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useState } from "react";

const MarkdownPreview: React.ComponentType<MarkdownPreviewProps> = dynamic(
	() => import("@uiw/react-markdown-preview").then((mod) => mod.default),
	{ ssr: false }
);

const FAQ = () => {
	const [source, setSource] = useState("");

	useEffect(() => {
		fetch("https://raw.githubusercontent.com/faisalsayed10/firefiles/main/docs/FAQ.md")
			.then((res) => res.text())
			.then((text) => setSource(text));
	}, []);

	return (
		<>
			<Head>
				<title>Firefiles | FAQ</title>
			</Head>
			<div className="main bg-black min-h-screen" data-color-mode="dark">
				<div className="max-w-4xl p-10 m-auto">
					<MarkdownPreview style={{ background: "transparent" }} source={source} />
				</div>
			</div>
		</>
	);
};

export default FAQ;
