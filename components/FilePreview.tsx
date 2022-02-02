import { Box, Flex, Image, Link, Text } from "@chakra-ui/react";
import { download } from "@util/helpers";
import { StorageReference } from "firebase/storage";
import dynamic from "next/dynamic";
import "node_modules/video-react/dist/video-react.css";
import React, { useState } from "react";
import { LoadingSpinner, Player } from "video-react";

const FileViewer = dynamic(() => import("react-file-viewer"), { ssr: false });

type Props = {
	mimetype: string;
	url: string;
	file: StorageReference;
};

const FilePreview: React.FC<Props> = ({ mimetype, url, file }) => {
	const [isError, setIsError] = useState(false);

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
			<audio controls onError={() => setIsError(true)}>
				<source src={url} type={mimetype} />
				Your browser does not support playing audio.
			</audio>
		);
	} else if (mimetype === "application/pdf") {
		return <iframe src={url} height={700} title={file.name} onError={() => setIsError(true)} />;
	} else if (mimetype === "TODO:") {
    // @ts-ignore
		<FileViewer fileType="csv" filePath={url} />;
	}

	return <Box></Box>;
};

const Error = ({ file, url }) => {
	return (
		<Flex flexDir="column" align="center" justify="center">
			<Text as="h1" fontSize="2xl">
				Failed to preview the file.
			</Text>
			<Text as="p">
				{/* TODO: Create documentation for CORS  */}
				Make sure you've{" "}
				<Link href="https://firefiles.vercel.app/docs/" target="_blank">
					configured CORS
				</Link>{" "}
				correctly.
			</Text>
			<Text as="p" fontSize="lg">
				Try opening it in a{" "}
				<Link href={url} target="_blank">
					new tab
				</Link>{" "}
				or
				<Link onClick={() => download(file.name, url)}>downloading it</Link> instead.
			</Text>
		</Flex>
	);
};

export default FilePreview;
