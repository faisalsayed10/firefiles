import useKeys from "@hooks/useKeys";
import { MarkdownPreviewProps } from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { TextareaCodeEditorProps } from "@uiw/react-textarea-code-editor";
import "@uiw/react-textarea-code-editor/dist.css";
import { download } from "@util/helpers";
import { DriveFile, Provider } from "@util/types";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import "node_modules/video-react/dist/video-react.css";
import Papa from "papaparse";
import React, { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ExternalLink, FileDownload } from "tabler-icons-react";
import { Player } from "video-react";

const CodeEditor: React.ComponentType<TextareaCodeEditorProps> = dynamic(
	() => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
	{ ssr: false }
);

const MarkdownPreview: React.ComponentType<MarkdownPreviewProps> = dynamic(
	() => import("@uiw/react-markdown-preview").then((mod) => mod.default),
	{ ssr: false }
);

type Props = {
	url: string;
	file: DriveFile;
};

const FilePreview: React.FC<Props> = ({ url, file }) => {
	const [isError, setIsError] = useState(false);
	const [showRaw, setShowRaw] = useState(false);
	const [rawMd, setRawMd] = useState(false);
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);

	const extension = file.name.split(".").pop();

	const codeEditorStyles: React.CSSProperties = useMemo(
		() => ({
			height: "98%",
			color: "#2D3748",
			fontSize: 13,
			backgroundColor: "#FFFFFF",
			overflowY: "auto",
			fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
		}),
		[]
	);

	useEffect(() => {
		if (
			file?.contentType?.startsWith("text") ||
			file?.contentType === "application/json" ||
			file?.contentType === "text/markdown" ||
			extension === "md" ||
			showRaw
		) {
			setLoading(true);
			fetch(url)
				.then((res) => res.text())
				.then((text) => setText(text))
				.catch(() => setIsError(true))
				.finally(() => setLoading(false));
		}
	}, [showRaw]);

	if (isError) {
		return <Error file={file} url={url} />;
	} else if (file?.contentType?.startsWith("image")) {
		return <img src={url} alt={file.name} onError={() => setIsError(true)} />;
	} else if (file?.contentType?.startsWith("video")) {
		return (
			<div
				children={<Player fluid={false} playsInline src={url} onError={() => setIsError(true)} />}
			/>
		);
	} else if (file?.contentType?.startsWith("audio")) {
		return (
			<div className="flex items-center justify-center p-6">
				<audio controls onError={() => setIsError(true)}>
					<source src={url} type={file?.contentType} />
					Your browser does not support playing audio.
				</audio>
			</div>
		);
	} else if (file?.contentType === "application/pdf") {
		return (
			<iframe
				src={url}
				height={700}
				width="100%"
				title={file.name}
				style={{ minWidth: 500 }}
				onError={() => setIsError(true)}
			/>
		);
	} else if (file?.contentType === "text/csv") {
		return (
			<ErrorBoundary FallbackComponent={(...props) => <Error url={url} file={file} {...props} />}>
				<CsvViewer file={file} url={url} />
			</ErrorBoundary>
		);
	} else if (/^docx?$|^xlsx?$|^pptx?$/.test(extension)) {
		return <GoogleDocsViewer file={file} url={url} />;
	} else if (file?.contentType === "text/markdown" || extension === "md") {
		return (
			<>
				{loading || !text ? (
					"Loading..."
				) : (
					<div className="h-[600px]">
						<button className="m-1" onClick={() => setRawMd(!rawMd)}>
							{!rawMd ? "View Raw" : "View Parsed"}
						</button>
						{!rawMd ? (
							<MarkdownPreview
								source={text}
								disallowedElements={["script"]}
								style={{
									height: "90%",
									overflowY: "auto",
									padding: 15,
								}}
							/>
						) : (
							<CodeEditor
								value={text}
								disabled
								language={extension}
								padding={15}
								style={codeEditorStyles}
							/>
						)}
					</div>
				)}
			</>
		);
	} else if (
		file?.contentType?.startsWith("text") ||
		file?.contentType === "application/json" ||
		showRaw
	) {
		return (
			<>
				{loading || !text ? (
					"Loading..."
				) : (
					<div className="h-[600px]">
						<CodeEditor
							value={text}
							disabled
							language={extension}
							padding={15}
							style={{
								...codeEditorStyles,
								marginTop: 40,
							}}
						/>
					</div>
				)}
			</>
		);
	}

	return <NoPreview file={file} setShowRaw={setShowRaw} />;
};

const Error = ({ file, url }) => {
	const { keys } = useKeys();
	return (
		<div className="flex flex-col items-center justify-center p-6">
			<h1 className="text-2xl mb-4 text-center">Failed to preview the file</h1>
			{(Provider[keys.type] as Provider) === Provider.firebase && (
				<p className="mb-2">
					Make sure you've{" "}
					<Link href="https://firefiles.app/docs/firebase/03-cors" target="_blank">
						configured CORS correctly.
					</Link>
				</p>
			)}

			<button onClick={() => window.open(url, "_blank")}>
				<ExternalLink /> Open in new tab
			</button>
			<button onClick={() => download(file)}>
				<FileDownload /> Download
			</button>
		</div>
	);
};

const NoPreview = ({ file, setShowRaw }) => {
	return (
		<div className="flex flex-col items-center justify-center p-6">
			<h1 className="text-2xl mb-4 text-center">Preview not available</h1>
			<button onClick={() => setShowRaw(true)}>Show Raw</button>
			<button onClick={() => download(file)}>
				<FileDownload /> Download
			</button>
		</div>
	);
};

const GoogleDocsViewer = ({ file, url }) => {
	return (
		<div className="flex flex-col items-center justify-center p-6">
			<h1 className="text-2xl mb-4 text-center">Couldn't preview the file</h1>
			<button
				onClick={() =>
					window.open(
						`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`,
						"_blank"
					)
				}
			>
				Open with Google Docs Viewer
			</button>
			<button onClick={() => download(file)}>
				<FileDownload /> Download
			</button>
		</div>
	);
};

const CsvViewer = ({ file, url }) => {
	const [data, setData] = useState([]);
	const [columns, setColumns] = useState([]);
	const [rawFile, setRawFile] = useState<File>();

	useEffect(() => {
		if (!file || !url) return;
		try {
			urlToFile(url, file.name).then((file) => setRawFile(file));
		} catch (err) {
			throw err.message;
		}
	}, [file, url]);

	useEffect(() => {
		if (!rawFile) return;
		Papa.parse(rawFile, { header: true, dynamicTyping: true, complete: handleDataChange });
	}, [rawFile]);

	const makeColumns = (rawColumns) =>
		rawColumns.map((column) => ({ Header: column, accessor: column }));

	const handleDataChange = (file) => {
		file.data.pop();
		setData(file.data);
		setColumns(makeColumns(file.meta.fields));
	};

	return (
		<div className="max-h-[700px] overflow-auto">
			{columns.length > 0 ? (
				<table>
					<thead>
						<tr>
							{columns.map((column) => (
								<th key={column.Header}>{column.Header.replaceAll('"', "")}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.map((row, i) => (
							<tr key={row.id}>
								{columns.map((column) => (
									<td key={column.accessor}>{row[column.accessor]}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			) : (
				"Loading..."
			)}
		</div>
	);
};

const urlToFile = async (url: string, name: string) => {
	try {
		const blob: any = await fetch(url).then((r) => r.blob());
		blob.lastModifiedDate = new Date();
		blob.name = name;
		return blob as File;
	} catch (err) {
		throw err.message;
	}
};

export default FilePreview;
