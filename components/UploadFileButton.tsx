import { Button, chakra, Input, useColorModeValue } from "@chakra-ui/react";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { storage } from "@util/firebase";
import { CurrentlyUploading } from "@util/types";
import { ACTIONS, ReducerAction, ROOT_FOLDER } from "hooks/useFolder";
import { ref, StorageReference, uploadBytesResumable } from "firebase/storage";
import React, { useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import toast from "react-hot-toast";

interface Props {
	dispatch: React.Dispatch<ReducerAction>;
	currentFolder: StorageReference;
	filesToUpload: File[];
	uploadingFiles: CurrentlyUploading[];
	setFilesToUpload: React.Dispatch<React.SetStateAction<File[]>>;
	setUploadingFiles: React.Dispatch<React.SetStateAction<CurrentlyUploading[]>>;
}

const UploadFileButton: React.FC<Props> = ({
	dispatch,
	currentFolder,
	filesToUpload,
	setFilesToUpload,
	uploadingFiles,
	setUploadingFiles
}) => {
	const fileInput = useRef<HTMLInputElement>();

	useEffect(() => {
		if (!filesToUpload || filesToUpload.length < 1) return;
		handleUpload(null, filesToUpload);
	}, [filesToUpload]);

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, filesToUpload: File[]) => {
		const files = filesToUpload || e?.target.files;
		if (currentFolder == null || files == null || files?.length < 1) return;

		for (let i = 0; i < files.length; i++) {
			const id = nanoid();
			if (/[#\$\[\]\*/]/.test(files[i].name)) {
				toast.error("File name cannot contain special characters (#$[]*/).");
				return;
			}

			setUploadingFiles((prev) =>
				prev.concat([{ id, name: files[i].name, progress: 0, error: false }])
			);

			const filePath =
				currentFolder === ROOT_FOLDER
					? files[i].name
					: `${decodeURIComponent(currentFolder.fullPath)}/${files[i].name}`;

			const fileRef = ref(storage, filePath);
			const uploadTask = uploadBytesResumable(fileRef, files[i]);

			uploadTask.on(
				"state_changed",
				(snapshot) => {
					setUploadingFiles((prevUploadingFiles) => {
						return prevUploadingFiles.map((uploadFile) => {
							if (uploadFile.id === id) {
								return {
									...uploadFile,
									progress: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
								};
							}

							return uploadFile;
						});
					});
				},
				() => {
					setUploadingFiles((prevUploadingFiles) => {
						return prevUploadingFiles.map((uploadFile) => {
							if (uploadFile.id === id) {
								return { ...uploadFile, error: true };
							}
							return uploadFile;
						});
					});
				},
				async () => {
					setUploadingFiles((prevUploadingFiles) => {
						return prevUploadingFiles.filter((uploadFile) => {
							return uploadFile.id !== id;
						});
					});

					dispatch({ type: ACTIONS.ADD_FILE, payload: { childFiles: [fileRef] } });
					toast.success("File uploaded successfully.");
					setFilesToUpload([]);
				}
			);
		}
	};

	return (
		<>
			<Input
				type="file"
				ref={fileInput}
				hidden={true}
				onChange={(e) => handleUpload(e, null)}
				key={nanoid()}
				multiple
			/>
			<Button
				disabled={uploadingFiles.filter((uploadingFile) => !uploadingFile.error).length > 0}
				pos="fixed"
				p="6"
				borderRadius="50%"
				w="60px"
				h="60px"
				bottom="2rem"
				right="2rem"
				variant="outline"
				bgColor={useColorModeValue("white", "#1a202c")}
				_focus={{ outline: "none" }}
				className="upload-hover"
				transition="all 0.2s"
				boxShadow="4.2px 4px 6.5px -1.7px rgba(0, 0, 0, 0.4)"
				colorScheme="green"
				aria-label="upload file"
				onClick={() => fileInput.current.click()}
			>
				<FontAwesomeIcon icon={faUpload} />
				<chakra.span transition="all 0.2s" display="none" className="upload-text">
					Upload File
				</chakra.span>
			</Button>
		</>
	);
};

export default UploadFileButton;
