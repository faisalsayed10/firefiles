import OptionsPopover from "@components/popups/OptionsPopover";
import useBucket from "@hooks/useBucket";
import useKeys from "@hooks/useKeys";
import { DriveFolder, Provider } from "@util/types";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { ExternalLink, Folder as FolderIcon, FolderMinus, Plus } from "tabler-icons-react";
import DeleteAlert from "../popups/DeleteAlert";

interface Props {
	folder: DriveFolder;
	setIsFolderDeleting: React.Dispatch<React.SetStateAction<boolean>>;
}

const Folder: React.FC<Props> = ({ folder, setIsFolderDeleting }) => {
	const [isOpen, setIsOpen] = useState(false);
	const onClose = () => setIsOpen(false);
	const router = useRouter();
	const cancelRef = useRef();
	const { removeFolder } = useBucket();

	const optionProps = {
		p: 2,
		cursor: "pointer",
	};

	return (
		<>
			<DeleteAlert
				cancelRef={cancelRef}
				onClose={onClose}
				isOpen={isOpen}
				onClick={async () => {
					try {
						setIsFolderDeleting(true);
						onClose();
						await removeFolder(folder);
					} catch (err) {
						console.error(err);
					} finally {
						setIsFolderDeleting(false);
					}
				}}
			/>
			<div className="hoverAnim h-[140px] border rounded-lg shadow-lg flex flex-col items-center justify-center transition-all ease-in-out duration-100 cursor-pointer text-[#2D3748] w-[140px]">
				<FolderIcon
					onClick={() => router.push(`${router.asPath}/${folder.name}`)}
					style={{ flex: 1, strokeWidth: "1px" }}
					size={72}
				/>
				<div className="flex items-center justify-between p-2 w-[inherit]">
					<p
						onClick={() => router.push(`${router.asPath}/${folder.name}`)}
						className="flex-1 truncate max-w-[150px] text-xs text-left px-2"
					>
						{folder.name}
					</p>
					<OptionsPopover header={folder.name}>
						<div className="flex items-stretch flex-col">
							<div
								className="flex"
								{...optionProps}
								onClick={() => router.push(`${router.asPath}/${folder.name}`)}
							>
								<Plus />
								<p className="ml-2">Open</p>
							</div>
							<hr />
							<div
								className="flex"
								{...optionProps}
								onClick={() => window.open(`${router.asPath}/${folder.name}`, "_blank")}
							>
								<ExternalLink />
								<p className="ml-2">Open in new tab</p>
							</div>
							<hr />
							<div className="flex" {...optionProps} onClick={() => setIsOpen(true)}>
								<FolderMinus />
								<p className="ml-2">Delete Folder</p>
							</div>
						</div>
					</OptionsPopover>
				</div>
			</div>
		</>
	);
};

export default Folder;
