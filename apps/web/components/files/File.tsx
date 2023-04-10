import { Dialog, Transition } from "@headlessui/react";
import useBucket from "@hooks/useBucket";
import { DriveFile } from "@util/types";
import copy from "copy-to-clipboard";
import { nanoid } from "nanoid";
import React, { Fragment, useRef, useState } from "react";
import toast from "react-hot-toast";
import DeleteAlert from "../popups/DeleteAlert";
import FileGrid from "./FileGrid";
import FilePreview from "./FilePreview";
import FileRow from "./FileRow";

interface Props {
	file: DriveFile;
	gridView?: boolean;
}

const File: React.FC<Props> = ({ file, gridView = false }) => {
	const [isOpen, setIsOpen] = useState(false);
	const { removeFile } = useBucket();
	const [id] = useState(nanoid());
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const cancelRef = useRef();
	const cancelButtonRef = useRef(null);

	const copyFile = () => {
		copy(file.url);
		toast.success("File URL copied to clipboard!");
	};

	const deleteFile = async () => {
		try {
			const success = await removeFile(file);
			if (!success) return;

			setIsOpen(false);
			toast.success("File deleted successfully!");
		} catch (err) {
			setIsOpen(false);
			console.error(err);
			toast.error(() => (
				<>
					<p className="font-bold">Error deleting file!</p>
					<p className="text-sm">{err.message}</p>
				</>
			));
		}
	};

	return (
		<>
			{gridView ? (
				<FileGrid
					copyFile={copyFile}
					file={file}
					id={id}
					onPreviewOpen={() => setIsPreviewOpen(true)}
					setIsOpen={setIsOpen}
				/>
			) : (
				<FileRow
					copyFile={copyFile}
					file={file}
					id={id}
					onPreviewOpen={() => setIsPreviewOpen(true)}
					setIsOpen={setIsOpen}
				/>
			)}

			<DeleteAlert
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				cancelRef={cancelRef}
				onClick={deleteFile}
			/>

			<Transition.Root show={isPreviewOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-10"
					initialFocus={cancelButtonRef}
					onClose={() => setIsPreviewOpen(false)}
				>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
					</Transition.Child>

					<div className="fixed inset-0 z-10 overflow-y-auto">
						<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
								enterTo="opacity-100 translate-y-0 sm:scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 translate-y-0 sm:scale-100"
								leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							>
								<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
									<FilePreview url={file.url} file={file} />
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition.Root>
		</>
	);
};

export default File;
