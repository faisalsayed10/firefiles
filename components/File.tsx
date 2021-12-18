import { Box, Button, Td, useClipboard, useToast } from "@chakra-ui/react";
import { faCopy, faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { storage } from "@util/firebase";
import { ACTIONS, ReducerAction } from "@util/useFolder";
import useUser from "@util/useUser";
import axios from "axios";
import { User } from "firebase/auth";
import { deleteObject, ref, StorageReference } from "firebase/storage";
import prettyBytes from "pretty-bytes";
import React, { useRef, useState } from "react";
import useSWRImmutable from "swr/immutable";
import DeleteAlert from "./DeleteAlert";

interface Props {
	dispatch: React.Dispatch<ReducerAction>;
	file: StorageReference;
}

const firebase_url = `https://firebasestorage.googleapis.com/v0/b`;
const metaFetcher = async (url: string, user: User) => {
	const token = await user.getIdToken();
	return axios.get(url, { headers: { Authorization: `Firebase ${token}` } });
};

const File: React.FC<Props> = ({ file, dispatch }) => {
	const [isOpen, setIsOpen] = useState(false);
	const { currentUser } = useUser();
	const { data } = useSWRImmutable(file ? file.fullPath : null, () =>
		metaFetcher(
			`${firebase_url}/${file.bucket}/o/${encodeURIComponent(file.fullPath)}`,
			currentUser
		)
	);
	const { onCopy } = useClipboard(data?.data?.download);
	const toast = useToast();
	const cancelRef = useRef();

	const handleClick = () => {
		onCopy();
		toast({
			title: "Copied",
			description: "File URL copied to clipboard!",
			status: "success",
			duration: 1000,
			isClosable: true
		});
	};

	const deleteFile = async () => {
		try {
			const reference = ref(storage, `${file?.parent.fullPath}/${file.name}`);
			deleteObject(reference).catch((e) => {});
			dispatch({ type: ACTIONS.REMOVE_FILE, payload: { childFiles: [reference] } });
			setIsOpen(false);
			toast({
				title: "Deleted",
				description: "File deleted successfully!",
				status: "info",
				duration: 1000,
				isClosable: true
			});
		} catch (err) {
			setIsOpen(false);
			console.error(err);
			toast({
				title: "An Error Occurred",
				description: err.message,
				status: "error",
				duration: 3000,
				isClosable: true
			});
		}
	};

	return (
		<Box as="tr">
			<Td fontWeight="medium" isTruncated>
				{file.name}
			</Td>
			<Td>{data?.data && prettyBytes(parseInt(data?.data.size) || 0)}</Td>
			<Td>
				<Button onClick={handleClick} isLoading={!data?.data} variant="outline" colorScheme="blue">
					<FontAwesomeIcon icon={faCopy} />
				</Button>
			</Td>
			<Td>
				<a href={data?.data?.download} target="_blank" rel="noreferrer" download={data?.data?.download}>
					<Button isLoading={!data?.data} variant="outline" colorScheme="blue">
						<FontAwesomeIcon icon={faDownload} />
					</Button>
				</a>
			</Td>
			<Td>
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
		</Box>
	);
};

export default File;
