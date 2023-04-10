import OptionsPopover from "@components/popups/OptionsPopover";
import { download } from "@util/helpers";
import { DriveFile } from "@util/types";
import Image from "next/image";
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

const FileGrid: React.FC<Props> = (props) => {
	const optionProps = {
		p: 2,
		cursor: "pointer",
	};

	return (
		<>
			<div className="cursor-pointer flex flex-col items-center border rounded-lg shadow-lg transition-all ease-in-out hoverAnim w-[140px] h-[140px] overflow-hidden">
				<div className="w-full h-[100px] overflow-hidden" onClick={props.onPreviewOpen}>
					{props.file?.contentType?.startsWith("image") ? (
						<Image
							src={props.file.url}
							alt={props.file.name}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="flex items-center justify-center h-full">
							<FileIcon extension={props.file.name.split(".").pop()} id={props.id} bigIcon={true} />
						</div>
					)}
				</div>
				<div className="flex p-2 w-full justify-between items-center">
					<p className="flex-1 truncate text-xs text-left px-2" onClick={props.onPreviewOpen}>
						{props.file.name}
					</p>
					<OptionsPopover
						header={props.file.name}
						footer={`Size: ${props.file.size && prettyBytes(parseInt(props.file.size) || 0)}`}
					>
						{!props.file ? (
							<p>Loading</p>
						) : (
							<div className="flex items-stretch flex-col">
								<div className="flex" {...optionProps} onClick={props.copyFile}>
									<Copy />
									<p className="ml-2">Share</p>
								</div>
								<div className="flex" {...optionProps} onClick={() => download(props.file)}>
									<FileDownload />
									<p className="ml-2">Download</p>
								</div>
								<div className="flex" {...optionProps} onClick={() => props.setIsOpen(true)}>
									<FileMinus />
									<p className="ml-2">Delete</p>
								</div>
							</div>
						)}
					</OptionsPopover>
				</div>
			</div>
		</>
	);
};

export default FileGrid;
