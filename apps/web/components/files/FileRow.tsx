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
		<tr>
			<td className="max-w-[36px]">
				<FileIcon extension={props.file.name.split(".").pop()} id={props.id} />
			</td>
			<td
				className="max-w-[250px] font-medium truncate underline cursor-pointer hover:text-blue-500"
				onClick={props.onPreviewOpen}
			>
				{props.file.name}
			</td>
			<td className="min-w-[110px]">
				{props.file.size && prettyBytes(parseInt(props.file.size) || 0)}
			</td>
			<td className="text-center">
				<button aria-label="Copy file URL" onClick={props.copyFile} disabled={!props.file.url}>
					<Copy />
				</button>
			</td>
			<td className="text-center">
				<button
					aria-label="Download file"
					disabled={!props.file.url}
					onClick={() => download(props.file)}
				>
					<FileDownload />
				</button>
			</td>
			<td className="text-center">
				<button aria-label="Delete file" onClick={() => props.setIsOpen(true)}>
					<FileMinus />
				</button>
			</td>
		</tr>
	);
};

export default FileRow;
