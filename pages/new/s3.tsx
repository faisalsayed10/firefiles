import { Bucket, ListBucketsCommandOutput } from "@aws-sdk/client-s3";
import {
	Box,
	Button,
	Container,
	Divider,
	Flex,
	Heading,
	IconButton,
	Input,
	Select,
	Text
} from "@chakra-ui/react";
import AWSRegionSelect from "@components/ui/AWSRegionSelect";
import useUser from "@hooks/useUser";
import { sendEvent } from "@util/firebase";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowNarrowLeft } from "tabler-icons-react";
import "video-react/dist/video-react.css";

// TODO: Bucket name must be unique and must not contain spaces or uppercase letters

const NewS3 = () => {
	const { currentUser } = useUser();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [accessKey, setAccessKey] = useState("");
	const [secretKey, setSecretKey] = useState("");
	const [region, setRegion] = useState("");
	const [bucketName, setBucketName] = useState("");
	const [buckets, setBuckets] = useState<Bucket[]>([]);
	const [selectedBucket, setSelectedBucket] = useState("Not Selected");

	const handleSubmit = async (e: React.FormEvent<HTMLDivElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!currentUser) throw new Error("You need to login to perform this action!");

			if (!accessKey.trim() || !secretKey.trim() || !region.trim())
				throw new Error("One or more fields are missing!");

			const { data } = await axios.post<ListBucketsCommandOutput>("/api/s3/list-buckets", {
				accessKey,
				secretKey,
				region
			});

			setBuckets(data.Buckets);
		} catch (err) {
			console.error(err);
			toast.error(err?.response?.data?.error || err.message);
			sendEvent("bucket_create_error", { message: err.message });
		}

		setLoading(false);
	};

	const handleCreate = async () => {
		setLoading(true);

		try {
			if (!currentUser) throw new Error("You need to login to perform this action!");

			if (!accessKey.trim() || !secretKey.trim() || !region.trim())
				throw new Error("One or more fields are missing!");

			if (selectedBucket === "Not Selected" && !bucketName.trim())
				throw new Error("Select an existing bucket or enter a new bucket name!");

			const Bucket = selectedBucket !== "Not Selected" ? selectedBucket : bucketName.trim();

			await axios.post(
				"/api/bucket",
				{ data: { accessKey, secretKey, Bucket, region }, name: Bucket, type: "s3" },
				{ headers: { token: await currentUser.getIdToken() } }
			);

			toast.success("Bucket created successfully!");
			router.push("/");
			sendEvent("bucket_create", { type: "s3" });
		} catch (err) {
			console.error(err);
			toast.error(err?.response?.data?.error || err.message);
			sendEvent("bucket_create_error", { message: err.message });
		}

		setLoading(false);
	};

	return (
		<>
			<Flex px="16px" pt="3">
				<IconButton
					variant="ghost"
					aria-label="back"
					icon={<ArrowNarrowLeft />}
					mr="3"
					onClick={() => router.push("/new")}
				/>
				<Heading as="h3" size="lg">
					Enter your AWS keys
				</Heading>
			</Flex>
			<Container display="flex" minH="90vh" flexDir="column" justifyContent="center">
				<Flex as="form" onSubmit={handleSubmit} flexDir="column" w="full">
					<Input
						mb="2"
						variant="flushed"
						placeholder="Access Key ID"
						type="text"
						value={accessKey}
						onChange={(e) => setAccessKey(e.target.value)}
						required
					/>
					<Input
						mb="2"
						variant="flushed"
						placeholder="Secret Access Key"
						type="text"
						value={secretKey}
						onChange={(e) => setSecretKey(e.target.value)}
						required
					/>
					<AWSRegionSelect value={region} onChange={(e) => setRegion(e.target.value)} />
					{/* TODO: <VideoAccordion src="/aws-keys-tutorial.mov" /> */}
					<Button mt="2" type="submit" isLoading={loading} colorScheme="green" variant="solid">
						Next
					</Button>
				</Flex>
				{buckets?.length > 0 ? (
					<>
						<Divider my="6" />
						<Box>
							<Heading as="h4" size="md" mb="2">
								Found {buckets.length} buckets:
							</Heading>
							<Text fontSize="sm">Choose a bucket:</Text>
							<Select value={selectedBucket} onChange={(e) => setSelectedBucket(e.target.value)}>
								<option>Not Selected</option>
								{buckets.map((bucket) => (
									<option key={bucket.CreationDate.toString()} value={bucket.Name}>
										{bucket.Name}
									</option>
								))}
							</Select>
							<Text fontSize="lg" align="center" my="2">
								OR
							</Text>
							<Text fontSize="sm">Create New:</Text>
							<Input
								mb="2"
								variant="flushed"
								placeholder="Bucket Name"
								type="text"
								value={bucketName}
								onChange={(e) => setBucketName(e.target.value)}
								required
							/>
							<Button
								mt="2"
								w="full"
								isLoading={loading}
								onClick={handleCreate}
								colorScheme="green"
								variant="solid"
							>
								Create
							</Button>
						</Box>
					</>
				) : null}
			</Container>
		</>
	);
};

export default NewS3;
