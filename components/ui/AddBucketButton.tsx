import {
	Button,
	Flex,
	IconButton,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	useDisclosure
} from "@chakra-ui/react";
import S3Input from "@components/popups/S3Input";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useUser from "@hooks/useUser";
import { sendEvent } from "@util/firebase";
import { BucketType } from "@util/types";
import axios from "axios";
import { nanoid } from "nanoid";
import "node_modules/video-react/dist/video-react.css";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import { omit } from "underscore";
import BucketOptions from "../popups/BucketSelector";
import FirebaseInput from "../popups/FirebaseInput";

const AddBucketButton = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { mutate } = useSWRConfig();
	const { currentUser } = useUser();
	const [selectedType, setSelectedType] = useState<BucketType>(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [value, setValue] = useState(null);

	const onSubmit = async (e: any) => {
		try {
			e.preventDefault();
			setError("");
			setLoading(true);

			if (selectedType === BucketType.firebase) {
				if (
					!value ||
					!value.apiKey ||
					!value.projectId ||
					!value.appId ||
					!value.authDomain ||
					!value.storageBucket
				)
					throw new Error("One or more fields are missing from the config.");
			} else if (selectedType === BucketType.s3) {
				if (!value || !value.accessKey || !value.secretKey)
					throw new Error("Access Key and Secret Key are required.");
			}

			const promise = axios.post(
				"/api/bucket",
				{ data: omit(value, "name"), name: value.name || nanoid(10), type: BucketType[selectedType] },
				{ headers: { token: await currentUser.getIdToken() } }
			);

			toast.promise(promise, {
				loading: "Creating bucket...",
				success: "Bucket created successfully.",
				error: "An error occurred while creating the bucket."
			});

			promise.then(() => {
				mutate("/api/get-buckets");
				sendEvent("bucket_create", { type: BucketType[selectedType] });
			});
			onClose();
		} catch (err) {
			setError(err.message.replace("Firebase: ", ""));
			sendEvent("bucket_create_error", { message: err.message });
		}

		setLoading(false);
	};

	const modalBody = () => {
		switch (selectedType) {
			case null:
				return <BucketOptions setSelectedType={setSelectedType} />;
			case BucketType.firebase:
				return <FirebaseInput setValue={setValue} error={error} />;
			case BucketType.s3:
				return <S3Input setValue={setValue} error={error} />;
		}
	};

	return (
		<>
			<Flex
				align="center"
				justify="center"
				h="110px"
				boxShadow="0 3px 10px rgb(0,0,0,0.2)"
				transition="ease-in-out 0.1s"
				cursor="pointer"
				className="hoverAnim"
				onClick={onOpen}
			>
				<FontAwesomeIcon icon={faPlus} size="2x" />
			</Flex>
			<Modal isOpen={isOpen} onClose={onClose} isCentered autoFocus={false}>
				<ModalOverlay />
				<ModalContent maxH="700px" overflowY="auto">
					<ModalHeader>
						{selectedType != null ? (
							<>
								<IconButton
									aria-label="back"
									icon={<FontAwesomeIcon icon={faArrowLeft} />}
									variant="unstyled"
									onClick={() => setSelectedType(null)}
								/>
								Enter Keys
							</>
						) : (
							"Select Provider"
						)}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>{modalBody()}</ModalBody>
					<ModalFooter>
						{selectedType != null ? (
							<>
								<Button mr={3} onClick={onClose} variant="ghost">
									Close
								</Button>
								<Button onClick={onSubmit} colorScheme="blue" isLoading={loading}>
									Create
								</Button>
							</>
						) : null}
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default AddBucketButton;
