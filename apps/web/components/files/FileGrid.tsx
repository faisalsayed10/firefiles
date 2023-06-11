import OptionsPopover from "@components/popups/OptionsPopover";
import { download } from "@util/helpers";
import { DriveFile } from "@util/types";
import Image from "next/image";
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
						options={[
							{
								name: "Share",
								icon: <Copy />,
								onClick: props.copyFile,
							},
							{
								name: "Download",
								icon: <FileDownload />,
								onClick: () => download(props.file),
							},
							{
								name: "Delete",
								icon: <FileMinus />,
								onClick: () => props.setIsOpen(true),
							},
						]}
					/>
				</div>
			</div>
		</>
	);
};

export default FileGrid;
