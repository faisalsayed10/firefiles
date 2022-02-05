import {
	Box,
	Button,
	ButtonGroup,
	Flex,
	Image,
	Link,
	Table,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr,
	useColorMode
} from "@chakra-ui/react";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MarkdownPreviewProps } from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { TextareaCodeEditorProps } from "@uiw/react-textarea-code-editor";
import "@uiw/react-textarea-code-editor/dist.css";
import { download } from "@util/helpers";
import { StorageReference } from "firebase/storage";
import dynamic from "next/dynamic";
import "node_modules/video-react/dist/video-react.css";
import Papa from "papaparse";
import React, { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingSpinner, Player } from "video-react";

const CodeEditor: React.ComponentType<TextareaCodeEditorProps> = dynamic(
	() => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
	{ ssr: false }
);

const MarkdownPreview: React.ComponentType<MarkdownPreviewProps> = dynamic(
	() => import("@uiw/react-markdown-preview").then((mod) => mod.default),
	{ ssr: false }
);

type Props = {
	mimetype: string;
	url: string;
	file: StorageReference;
};

const FilePreview: React.FC<Props> = ({ mimetype, url, file }) => {
	const [isError, setIsError] = useState(false);
	const [showRaw, setShowRaw] = useState(false);
	const [rawMd, setRawMd] = useState(false);
	const [text, setText] = useState("");

	const extension = file.name.split(".").pop();
	const { colorMode } = useColorMode();

	const codeEditorStyles: React.CSSProperties = useMemo(
		() => ({
			height: "98%",
			color: colorMode === "light" ? "#2D3748" : "#FFFFFF",
			fontSize: 13,
			backgroundColor: colorMode === "light" ? "#FFFFFF" : "#2D3748",
			overflowY: "auto",
			fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace"
		}),
		[colorMode]
	);

	useEffect(() => {
		if (
			mimetype.startsWith("text") ||
			mimetype === "application/json" ||
			mimetype === "text/markdown" ||
			extension === "md" ||
			showRaw
		) {
			(async () => {
				const raw = await fetch(url).then((res) => res.text());
				setText(raw);
			})();
		}
	}, [showRaw]);

	if (isError) {
		return <Error file={file} url={url} />;
	} else if (mimetype.startsWith("image")) {
		return <Image src={url} alt={file.name} onError={() => setIsError(true)} />;
	} else if (mimetype.startsWith("video")) {
		return (
			<Box>
				<Player playsInline src={url} onError={() => setIsError(true)}>
					<LoadingSpinner />
				</Player>
			</Box>
		);
	} else if (mimetype.startsWith("audio")) {
		return (
			<Flex p="6" align="center" justify="center">
				<audio controls onError={() => setIsError(true)}>
					<source src={url} type={mimetype} />
					Your browser does not support playing audio.
				</audio>
			</Flex>
		);
	} else if (mimetype === "application/pdf") {
		return (
			<iframe
				src={url}
				height={700}
				width="100%"
				title={file.name}
				onError={() => setIsError(true)}
			/>
		);
	} else if (mimetype === "text/csv") {
		return (
			<ErrorBoundary FallbackComponent={(...props) => <Error url={url} file={file} {...props} />}>
				<CsvViewer file={file} url={url} />
			</ErrorBoundary>
		);
	} else if (/^docx?$|^xlsx?$|^pptx?$/.test(extension)) {
		return <GoogleDocsViewer file={file} url={url} />;
	} else if (mimetype === "text/markdown" || extension === "md") {
		return (
			<Box height="600px">
				<Button variant="ghost" m="1" onClick={() => setRawMd(!rawMd)}>
					{!rawMd ? "View Raw" : "View Parsed"}
				</Button>
				{!rawMd ? (
					<MarkdownPreview
						source={text}
						disallowedElements={["script"]}
						style={{ height: "90%", overflowY: "auto", padding: 15 }}
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
			</Box>
		);
	} else if (mimetype.startsWith("text") || mimetype === "application/json" || showRaw) {
		return (
			<Box height="600px">
				<CodeEditor
					value={text}
					disabled
					language={extension}
					padding={15}
					style={{ ...codeEditorStyles, marginTop: 40 }}
				/>
			</Box>
		);
	}

	return <NoPreview file={file} url={url} setShowRaw={setShowRaw} />;
};

const Error = ({ file, url }) => {
	return (
		<Flex flexDir="column" align="center" justify="center" p="6">
			<Text as="h1" fontSize="2xl" mb="4" align="center">
				Failed to preview the file
			</Text>
			<Text as="p" mb="2">
				{/* TODO: Create documentation for CORS  */}
				Make sure you've{" "}
				<Link href="https://firefiles.vercel.app/docs/" target="_blank" textDecor="underline">
					configured CORS correctly.
				</Link>
			</Text>
			<ButtonGroup>
				<Button
					leftIcon={<FontAwesomeIcon icon={faDownload} />}
					onClick={() => window.open(url, "_blank")}
				>
					Open in new tab
				</Button>
				<Button
					leftIcon={<FontAwesomeIcon icon={faDownload} />}
					onClick={() => download(file.name, url)}
				>
					Download It
				</Button>
			</ButtonGroup>
		</Flex>
	);
};

const NoPreview = ({ file, url, setShowRaw }) => {
	return (
		<Flex flexDir="column" align="center" justify="center" p="6">
			<Text as="h1" fontSize="2xl" mb="4" align="center">
				Preview not available
			</Text>
			<ButtonGroup>
				<Button onClick={() => setShowRaw(true)}>Show Raw</Button>
				<Button
					leftIcon={<FontAwesomeIcon icon={faDownload} />}
					onClick={() => download(file.name, url)}
				>
					Download It
				</Button>
			</ButtonGroup>
		</Flex>
	);
};

const GoogleDocsViewer = ({ file, url }) => {
	return (
		<Flex flexDir="column" align="center" justify="center" p="6">
			<Text as="h1" fontSize="2xl" align="center" fontWeight="semibold" mb="4">
				Couldn't preview the file
			</Text>
			<ButtonGroup>
				<Button
					onClick={() =>
						window.open(
							`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`,
							"_blank"
						)
					}
				>
					Open with Google Docs Viewer
				</Button>
				<Button
					leftIcon={<FontAwesomeIcon icon={faDownload} />}
					onClick={() => download(file.name, url)}
				>
					Download It
				</Button>
			</ButtonGroup>
		</Flex>
	);
};

const CsvViewer = ({ file, url }) => {
	const [data, setData] = useState([]);
	const [columns, setColumns] = useState([]);
	const [rawFile, setRawFile] = useState<File>();

	useEffect(() => {
		if (!file || !url) return;
		(async () => {
			const res = await urlToFile(url, file.name);
			setRawFile(res);
		})();
	}, [file, url]);

	useEffect(() => {
		if (!rawFile) return;
		Papa.parse(rawFile, {
			header: true,
			dynamicTyping: true,
			complete: handleDataChange
		});
	}, [rawFile]);

	const makeColumns = (rawColumns) => {
		return rawColumns.map((column) => {
			return { Header: column, accessor: column };
		});
	};

	const handleDataChange = (file) => {
		file.data.pop();
		setData(file.data);
		setColumns(makeColumns(file.meta.fields));
	};

	return (
		<Box maxH="700px" overflowY="auto" overflowX="auto">
			<Table variant="striped" size="sm">
				<Thead>
					<Tr>
						<Th>#</Th>
						{columns.map((column) => (
							<Th key={column.Header}>{column.Header}</Th>
						))}
					</Tr>
				</Thead>
				<Tbody>
					{data.map((row, i) => (
						<Tr key={row.id}>
							<Td>{i + 1}</Td>
							{columns.map((column) => (
								<Td key={column.accessor}>{row[column.accessor]}</Td>
							))}
						</Tr>
					))}
				</Tbody>
			</Table>
		</Box>
	);
};

const urlToFile = async (url: string, name: string) => {
	const blob: any = await fetch(url).then((r) => r.blob());
	blob.lastModifiedDate = new Date();
	blob.name = name;
	return blob as File;
};

export default FilePreview;
