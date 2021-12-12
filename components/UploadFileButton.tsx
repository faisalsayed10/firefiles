import { Button, chakra, Input, useColorModeValue, useToast } from "@chakra-ui/react";
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from "@firebase/firestore";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { database, firestore, storage } from "@util/firebase";
import { CurrentlyUploading } from "@util/types";
import { ROOT_FOLDER } from "@util/useFolder";
import { getDownloadURL, ref, StorageReference, uploadBytesResumable } from "firebase/storage";
import React, { useEffect, useRef } from "react";
import uniqid from "uniqid";

interface Props {
	currentFolder: StorageReference;
	filesToUpload: File[];
	uploadingFiles: CurrentlyUploading[];
	setFilesToUpload: React.Dispatch<React.SetStateAction<File[]>>;
	setUploadingFiles: React.Dispatch<React.SetStateAction<CurrentlyUploading[]>>;
}

const UploadFileButton: React.FC<Props> = ({
	currentFolder,
	filesToUpload,
	setFilesToUpload,
	uploadingFiles,
	setUploadingFiles
}) => {
	const fileInput = useRef<HTMLInputElement>();
	const toast = useToast();
	const input_id = uniqid();

	useEffect(() => {
		if (!filesToUpload || filesToUpload.length < 1) return;
		handleUpload(null, filesToUpload);
	}, [filesToUpload]);

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, filesToUpload: File[]) => {
		const files = filesToUpload || e?.target.files;
		if (currentFolder == null || files == null || files?.length < 1) return;

		for (let i = 0; i < files.length; i++) {
			const id = uniqid();
			if (/[#\$\[\]\*/]/.test(files[i].name)) {
				toast({
					title: "Invalid File Name",
					description: "File names cannot contain #$[]*/",
					status: "error",
					duration: 3000,
					isClosable: true
				});
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

					toast({
						title: "Success",
						description: "File uploaded successfully!",
						status: "success",
						duration: 1000,
						isClosable: true
					});

					const url = await getDownloadURL(fileRef);
					const findDoc = await getDocs(
						query(
							collection(firestore, "files"),
							where("name", "==", files[i].name),
							where("parentPath", "==", decodeURIComponent(currentFolder.fullPath))
						)
					);
					const found = findDoc.docs[0];

					if (found) {
						await updateDoc(found.ref, { url });
					} else {
						await setDoc(doc(firestore, "files", uniqid()), {
							name: files[i].name,
							size: files[i].size,
							url,
							parentPath: decodeURIComponent(currentFolder.fullPath),
							createdAt: database.getCurrentTimestamp()
						});
					}

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
				key={input_id}
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
