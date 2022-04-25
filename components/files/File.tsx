import {
	Button,
	Flex,
	Box,
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Td,
	Text,
	Tr,
	useClipboard,
	useDisclosure,
	Image,
	MenuItem,
	MenuList,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTrigger,
	Portal,
	Spacer,
} from "@chakra-ui/react";
import {
	faCopy,
	faDownload,
	faExternalLinkAlt,
	faPlus,
	faEllipsisH,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useFirebase from "@hooks/useFirebase";
import { sendEvent } from "@util/firebase";
import { download } from "@util/helpers";
import axios from "axios";
import { User } from "firebase/auth";
import { deleteObject, getStorage, ref, StorageReference } from "firebase/storage";
import { nanoid } from "nanoid";
import router from "next/router";
import prettyBytes from "pretty-bytes";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import useSWRImmutable from "swr/immutable";
import DeleteAlert from "../popups/DeleteAlert";
import FileIcon from "./FileIcon";
import FilePreview from "./FilePreview";
import { ContextMenu } from "chakra-ui-contextmenu";

interface Props {
	file: StorageReference;
	bigIcon?: boolean;
}

const firebase_url = `https://firebasestorage.googleapis.com/v0/b`;
const metaFetcher = async (url: string, user: User) =>
	axios
		.get(url, {
			headers: {
				Authorization: `Firebase ${await user.getIdToken()}`,
			},
		})
		.then(({ data }) => data);

const File: React.FC<Props> = ({ file, bigIcon = false }) => {
	const [isOpen, setIsOpen] = useState(false);
	const { app, appUser, removeFile } = useFirebase();
	const file_url = `${firebase_url}/${file.bucket}/o/${encodeURIComponent(file.fullPath)}`;
	const [id] = useState(nanoid());
	const { data } = useSWRImmutable(file ? file.fullPath : null, () =>
		metaFetcher(file_url, appUser)
	);
	const { onCopy } = useClipboard(`${file_url}?alt=media&token=${data?.downloadTokens}`);
	const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
	const cancelRef = useRef();

	const handleClick = () => {
		onCopy();
		toast.success("File URL copied to clipboard!");
		sendEvent("file_share", {});
	};

	const deleteFile = async () => {
		try {
			if (!app) return;
			const storage = getStorage(app);

			const reference = ref(storage, `${file?.parent.fullPath}/${file.name}`);
			deleteObject(reference).catch((_) => {});
			removeFile(reference);
			setIsOpen(false);
			toast.success("File deleted successfully!");
			sendEvent("file_delete", {});
		} catch (err) {
			setIsOpen(false);
			console.error(err);
			toast.error(() => (
				<>
					<Text fontWeight="bold">Error deleting file!</Text>
					<Text as="p" fontSize="sm">
						{err.message}
					</Text>
				</>
			));
		}
	};

	return (
		<>
			{bigIcon ? (
				<>
					<DeleteAlert
						isOpen={isOpen}
						onClose={() => setIsOpen(false)}
						cancelRef={cancelRef}
						onClick={deleteFile}
					/>

					<Flex direction="column" align="center" justify="space-between" w="100%" h="100%">
						<Box
							w="100%"
							h="100px"
							textAlign="center"
							objectFit="cover"
							overflow="hidden"
							onClick={onPreviewOpen}
							cursor="pointer"
						>
							{data?.contentType.startsWith("image") ? (
								<Image
									src={`${file_url}?alt=media&token=${data?.downloadTokens}`}
									alt={file.name}
									w="100%"
									h="100%"
									objectFit="cover"
									onError={() => setIsError(true)}
								/>
							) : (
								<FileIcon extension={file.name.split(".").pop()} id={id} bigIcon={true} />
							)}
						</Box>
						<Flex p="2" w="100%" justify="space-between" alignItems="center">
							<Text
								isTruncated={true}
								as="p"
								fontSize="xs"
								maxW="auto"
								pr="2"
								onClick={onPreviewOpen}
								cursor="pointer"
							>
								{file.name}
							</Text>
							<Popover>
								<PopoverTrigger>
									<Box as="button">
										<FontAwesomeIcon icon={faEllipsisH} />
									</Box>
								</PopoverTrigger>
								<Portal>
									<PopoverContent w="200px">
										<PopoverArrow />
										<PopoverHeader>
											<Text fontSize="sm" maxW="150px" fontStyle="bold" isTruncated={true}>
												{file.name}
											</Text>
										</PopoverHeader>
										<PopoverCloseButton mt="0.5" />
										<PopoverBody my="-2" mx="-3">
											<Flex alignItems="start" flexDirection="column">
												<Box
													as="button"
													py="2"
													px="4"
													w="100%"
													textAlign="left"
													onClick={handleClick}
													_hover={{
														backgroundColor: "gray.600",
													}}
												>
													<FontAwesomeIcon
														style={{
															marginRight: "10px",
														}}
														icon={faCopy}
													/>
													Share
												</Box>
												<Box
													as="button"
													py="2"
													px="4"
													w="100%"
													textAlign="left"
													onClick={() =>
														download(
															file.name,
															`${file_url}?alt=media&token=${data?.downloadTokens}`
														)
													}
													_hover={{
														backgroundColor: "gray.600",
													}}
												>
													<FontAwesomeIcon
														style={{
															marginRight: "10px",
														}}
														icon={faDownload}
													/>
													Download
												</Box>
												<Box
													as="button"
													py="2"
													px="4"
													w="100%"
													textAlign="left"
													onClick={() => setIsOpen(true)}
													_hover={{
														backgroundColor: "gray.600",
													}}
												>
													<FontAwesomeIcon
														style={{
															marginRight: "10px",
														}}
														icon={faTrash}
													/>
													Delete
												</Box>
											</Flex>
										</PopoverBody>
										<PopoverFooter fontSize="12" fontStyle="italic">
											Size: {data && prettyBytes(parseInt(data.size) || 0)}
										</PopoverFooter>
									</PopoverContent>
								</Portal>
							</Popover>
						</Flex>
					</Flex>
				</>
			) : (
				<Tr>
					<Td maxW="36px">
						<FileIcon extension={file.name.split(".").pop()} id={id} />
					</Td>
					<Td
						fontWeight="medium"
						isTruncated
						maxW={["250px", "300px", "300px"]}
						onClick={onPreviewOpen}
						textDecor="underline"
						cursor="pointer"
						_hover={{ textDecor: "none" }}
					>
						{file.name}
					</Td>
					<Td minW="110px">{data && prettyBytes(parseInt(data.size) || 0)}</Td>
					<Td textAlign="center">
						<Button onClick={handleClick} isLoading={!data} variant="outline" colorScheme="blue">
							<FontAwesomeIcon icon={faCopy} />
						</Button>
					</Td>
					<Td textAlign="center">
						<Button
							isLoading={!data}
							variant="outline"
							colorScheme="blue"
							onClick={() =>
								download(file.name, `${file_url}?alt=media&token=${data?.downloadTokens}`)
							}
						>
							<FontAwesomeIcon icon={faDownload} />
						</Button>
					</Td>
					<Td textAlign="center">
						<Button onClick={() => setIsOpen(true)} variant="outline" colorScheme="red">
							<FontAwesomeIcon icon={faTrash} />
						</Button>
						<DeleteAlert
							isOpen={isOpen}
							onClose={() => setIsOpen(false)}
							cancelRef={cancelRef}
							onClick={deleteFile}
						/>
					</Td>
				</Tr>
			)}

			<Modal isOpen={isPreviewOpen} onClose={onPreviewClose} isCentered size="xl">
				<ModalOverlay />
				<ModalContent p="0" maxH="700px">
					<ModalCloseButton
						_focus={{
							outline: "none",
							border: "none",
						}}
						backgroundColor="gray.700"
					/>
					<FilePreview
						mimetype={data?.contentType}
						url={`${file_url}?alt=media&token=${data?.downloadTokens}`}
						file={file}
					/>
				</ModalContent>
			</Modal>
		</>
	);
};

export default File;
