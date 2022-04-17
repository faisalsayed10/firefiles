import {
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Link,
  Text,
  Textarea
} from "@chakra-ui/react";
import VideoAccordion from "@components/ui/VideoAccordion";
import useUser from "@hooks/useUser";
import { sendEvent } from "@util/firebase";
import axios from "axios";
import toObject from "convert-to-object";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowNarrowLeft } from "tabler-icons-react";
import "video-react/dist/video-react.css";

const jsonPlaceholder = `{
  apiKey: "AIzafeaubu13ub13j",
  authDomain: "myapp-f3190.firebaseapp.com",
  projectId: "myapp-f3190",
  storageBucket: "myapp-f3190.appspot.com",
  appId: "1:8931361818:web:132af17fejaj3695cf"
}`;

const NewFirebase = () => {
	const [raw, setRaw] = useState("");
	const { currentUser } = useUser();
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLDivElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!currentUser) throw new Error("You need to login to perform this action!");

			const data = toObject(raw);
			if (!data || !data.apiKey || !data.projectId || !data.appId || !data.authDomain || !data.storageBucket)
				throw new Error("One or more fields are missing!");

			const promise = axios.post(
				"/api/bucket",
				{
					data,
					name: data.projectId,
					type: "firebase"
				},
				{ headers: { token: await currentUser.getIdToken() } }
			);

			toast.promise(promise, {
				loading: "Creating bucket...",
				success: "Bucket created successfully.",
				error: "An error occurred while creating the bucket."
			});

			promise.then(() => {
				sendEvent("bucket_create", { type: "firebase" });
				router.push("/");
			});
		} catch (err) {
			console.error(err);
			toast.error(err.message);
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
					Paste your Firebase config
				</Heading>
			</Flex>
			<Container display="flex" minH="90vh" alignItems="center">
				<Flex as="form" onSubmit={handleSubmit} flexDir="column" w="full">
					<Textarea
						value={raw}
						onChange={(e) => setRaw(e.target.value)}
						minH="200px"
						placeholder={jsonPlaceholder}
						required
					/>
					<Text fontSize="xs">
						Make sure you've followed all the{" "}
						<Link
							href="https://firefiles.vercel.app/docs/hosted"
							target="_blank"
							textDecor="underline"
						>
							instructions.
						</Link>
					</Text>
					<VideoAccordion src="/firebase-config-tutorial.mov" />
					<Button
						type="submit"
						isLoading={loading}
            loadingText="Creating"
						colorScheme="green"
						variant="solid"
					>
						Create
					</Button>
				</Flex>
			</Container>
		</>
	);
};

export default NewFirebase;
