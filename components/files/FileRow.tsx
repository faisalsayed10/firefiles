import { IconButton, Td, Tr } from "@chakra-ui/react";
import { download } from "@util/helpers";
import { DriveFile } from "@util/types";
import prettyBytes from "pretty-bytes";
import React from "react";
import { Copy, FileDownload, FileMinus } from "tabler-icons-react";
import FileIcon from "./FileIcon";

interface Props {
	file: DriveFile;
	onPreviewOpen: () => void;
	copyFile: () => void;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	id: string;
}

const FileRow: React.FC<Props> = (props) => {
	return (
		<Tr>
			<Td maxW="36px">
				<FileIcon extension={props.file.name.split(".").pop()} id={props.id} />
			</Td>
			<Td
				fontWeight="medium"
				isTruncated
				maxW={["250px", "300px", "300px"]}
				onClick={props.onPreviewOpen}
				textDecor="underline"
				cursor="pointer"
				_hover={{ textDecor: "none" }}
			>
				{props.file.name}
			</Td>
			<Td minW="110px">{props.file.size && prettyBytes(parseInt(props.file.size) || 0)}</Td>
			<Td textAlign="center">
				<IconButton
					aria-label="Copy file URL"
					icon={<Copy />}
					onClick={props.copyFile}
					isLoading={!props.file.url}
					variant="outline"
					colorScheme="blue"
				/>
			</Td>
			<Td textAlign="center">
				<IconButton
					aria-label="Download file"
					icon={<FileDownload />}
					isLoading={!props.file.url}
					variant="outline"
					colorScheme="blue"
					onClick={() => download(props.file)}
				/>
			</Td>
			<Td textAlign="center">
				<IconButton
					aria-label="Delete file"
					icon={<FileMinus />}
					onClick={() => props.setIsOpen(true)}
					variant="outline"
					colorScheme="red"
				/>
			</Td>
		</Tr>
	);
};

export default FileRow;
