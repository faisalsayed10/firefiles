import useBucket from "@hooks/useBucket";
import { nanoid } from "nanoid";
import React, { useEffect, useRef } from "react";
import { FileUpload } from "tabler-icons-react";

interface Props {
	filesToUpload: File[];
	setFilesToUpload: React.Dispatch<React.SetStateAction<File[]>>;
}

const UploadFileButton: React.FC<Props> = ({ filesToUpload, setFilesToUpload }) => {
	const { addFile, loading, uploadingFiles, currentFolder } = useBucket();
	const fileInput = useRef<HTMLInputElement>();

	useEffect(() => {
		if (!filesToUpload || filesToUpload.length < 1) return;
		handleUpload(null, filesToUpload);
	}, [filesToUpload]);

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, filesToUpload: File[]) => {
		const files = filesToUpload || e?.target.files;
		if (!currentFolder || !files || files?.length < 1) return;

		await addFile(files);
		setFilesToUpload([]);
	};

	return (
		<>
			<input
				type="file"
				ref={fileInput}
				hidden={true}
				onChange={(e) => handleUpload(e, null)}
				key={nanoid()}
				multiple
			/>
			<button
				disabled={
					uploadingFiles.filter((uploadingFile) => !uploadingFile.error).length > 0 || loading
				}
				className="transition-all duration-200 fixed p-4 rounded-full w-16 h-16 bottom-8 right-8 outline-none hover:opacity-100 shadow-lg"
				aria-label="upload file"
				onClick={() => fileInput.current.click()}
			>
				<FileUpload size="42px" />
			</button>
		</>
	);
};

export default UploadFileButton;
