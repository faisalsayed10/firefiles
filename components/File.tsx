import { Box, Button, Td, Text, useClipboard } from "@chakra-ui/react";
import { faCopy, faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { storage } from "@util/firebase";
import { ACTIONS, ReducerAction } from "hooks/useFolder";
import useUser from "@hooks/useUser";
import axios from "axios";
import { User } from "firebase/auth";
import { deleteObject, ref, StorageReference } from "firebase/storage";
import prettyBytes from "pretty-bytes";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
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
	const file_url = `${firebase_url}/${file.bucket}/o/${encodeURIComponent(file.fullPath)}`;
	const { data } = useSWRImmutable(file ? file.fullPath : null, () =>
		metaFetcher(file_url, currentUser)
	);
	const { onCopy } = useClipboard(`${file_url}?alt=media&token=${data?.data?.downloadTokens}`);
	const cancelRef = useRef();

	const handleClick = () => {
		onCopy();
		toast.success("File URL copied to clipboard!");
	};

	const deleteFile = async () => {
		try {
			const reference = ref(storage, `${file?.parent.fullPath}/${file.name}`);
			deleteObject(reference).catch((e) => {});
			dispatch({ type: ACTIONS.REMOVE_FILE, payload: { childFiles: [reference] } });
			setIsOpen(false);
			toast.success("File deleted successfully!");
		} catch (err) {
			setIsOpen(false);
			console.error(err);
			toast.error((t) => (
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
		<Box as="tr">
			<Td fontWeight="medium" isTruncated maxW={["250px", "300px", "300px"]}>
				{file.name}
			</Td>
			<Td minW="110px">{data?.data && prettyBytes(parseInt(data?.data.size) || 0)}</Td>
			<Td align="center">
				<Button onClick={handleClick} isLoading={!data?.data} variant="outline" colorScheme="blue">
					<FontAwesomeIcon icon={faCopy} />
				</Button>
			</Td>
			<Td align="center">
				<a
					href={`${file_url}?alt=media&token=${data?.data?.downloadTokens}`}
					target="_blank"
					rel="noreferrer"
					download={`${file_url}?alt=media&token=${data?.data?.downloadTokens}`}
				>
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
