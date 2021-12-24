import {
  Alert,
  AlertIcon,
  Box,
  Button, FormControl,
  Input,
  Text,
  useToast
} from "@chakra-ui/react";
import CenterContainer from "@components/CenterContainer";
import PasswordInput from "@components/PasswordInput";
import { firestore } from "@util/firebase";
import useUser from "@util/useUser";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function Login() {
	const { currentUser } = useUser();
	const [apikey, setApikey] = useState("");
	const [projectId, setProjectId] = useState("");
	const [appId, setAppId] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
  const toast = useToast();

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		try {
			setError("");
			setLoading(true);

			await setDoc(doc(firestore, "users", currentUser.uid), {
				apikey: apikey,
				authDomain: `${projectId}.firebaseapp.com`,
				projectId: projectId,
				storageBucket: `${projectId}.appspot.com`,
				appId: appId
			});
      toast({
				title: "Success",
				description: "Firebase credentials updated successfully.",
				status: "success",
				duration: 2000,
				isClosable: true
			});
		} catch (err) {
			setError(err.message.replace("Firebase: ", ""));
		}

		setLoading(false);
	};

	return (
		<CenterContainer>
			<Box
				w="sm"
				px="6"
				py="8"
				borderRadius="md"
				boxShadow="4.1px 4.1px 6.5px -1.7px rgba(0,0,0,0.2)"
			>
				<Text as="h2" fontSize="2xl" align="center" mb="8">
					Enter your Firebase Credentials
				</Text>
				{error && (
					<Alert status="error" fontSize="md">
						<AlertIcon />
						{error}
					</Alert>
				)}
				<Box as="form" onSubmit={handleSubmit}>
					<FormControl id="apikey" my="3">
						<PasswordInput
							value={apikey}
							onChange={(e) => setApikey(e.target.value)}
							placeholder="API Key"
						/>
					</FormControl>

					<FormControl id="projectId" mb="3">
						<Input
							autoComplete="off"
							variant="outline"
							type="text"
							placeholder="Project ID"
							value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
							required
						/>
					</FormControl>
					<FormControl id="appId" mb="3">
						<Input
							autoComplete="off"
							variant="outline"
							type="text"
							placeholder="App ID"
							value={appId}
              onChange={(e) => setAppId(e.target.value)}
							required
						/>
					</FormControl>
					<Button
						mb="3"
						colorScheme="green"
						variant="solid"
						isLoading={loading}
						w="full"
						type="submit"
					>
						Submit
					</Button>
				</Box>
			</Box>
		</CenterContainer>
	);
}
