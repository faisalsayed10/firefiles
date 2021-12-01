import { Button, chakra, Input, useToast, useColorModeValue } from "@chakra-ui/react";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { database, firestore, storage } from "@util/firebase";
import { CurrentlyUploading, FolderCollection } from "@util/types";
import { ROOT_FOLDER } from "@util/useFolder";
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React, { useRef } from "react";
import { v4 } from "uuid";

interface Props {
	currentFolder: FolderCollection;
	uploadingFiles: CurrentlyUploading[];
	setUploadingFiles: React.Dispatch<React.SetStateAction<CurrentlyUploading[]>>;
	setProgress: React.Dispatch<React.SetStateAction<number>>;
	progress: number;
}

const UploadFileButton: React.FC<Props> = ({
	currentFolder,
	setProgress,
	uploadingFiles,
	setUploadingFiles,
	progress
}) => {
	const fileInput = useRef<HTMLInputElement>();
	const toast = useToast();
	const id = v4();

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files[0];

		if (currentFolder == null || file == null) return;
		const nameArr = currentFolder.path.map((elem) => elem.name);

		setUploadingFiles((prevUploadingFiles) => [
			...prevUploadingFiles,
			{ id: id, name: file.name, progress, error: false }
		]);

		const filePath =
			currentFolder === ROOT_FOLDER
				? `${nameArr.join("/")}/${file.name}`
				: `${nameArr.join("/")}/${currentFolder.name}/${file.name}`;

		const fileRef = ref(storage, filePath);
		const uploadTask = uploadBytesResumable(fileRef, file);

		uploadTask.on(
			"state_changed",
			(snapshot) => {
				setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
				setUploadingFiles((prevUploadingFiles) => {
					return prevUploadingFiles.map((uploadFile) => {
						if (uploadFile.id === id) {
							return { ...uploadFile, progress };
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
			() => {
				setUploadingFiles((prevUploadingFiles) => {
					return prevUploadingFiles.filter((uploadFile) => {
						return uploadFile.id !== id;
					});
				});

				getDownloadURL(fileRef).then(async (url) => {
					await getDocs(
						query(
							collection(firestore, "files"),
							where("name", "==", file.name),
							where("folderId", "==", currentFolder.id)
						)
					).then(async (existingFiles) => {
						const existingFile = existingFiles.docs[0];
						if (existingFile) {
							await updateDoc(existingFile.ref, { url });
						} else {
							await setDoc(doc(firestore, "files", v4()), {
								url: url,
								name: file.name,
								createdAt: database.getCurrentTimestamp(),
								folderId: currentFolder.id,
								size: file.size,
								filePath
							});
						}
					});
				});
				toast({
					title: "Success",
					description: "File uploaded successfully!",
					status: "success",
					duration: 1000,
					isClosable: true
				});
			}
		);
	};

	return (
		<>
			<Input type="file" ref={fileInput} hidden={true} onChange={handleUpload} key={id} />
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
				colorScheme="cyan"
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
