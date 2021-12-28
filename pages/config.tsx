import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  Text,
  Textarea,
  useToast
} from "@chakra-ui/react";
import CenterContainer from "@components/CenterContainer";
import { faLongArrowAltLeft, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useUser from "@util/useUser";
import axios from "axios";
import toObject from "convert-to-object";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function Config() {
	const { currentUser, config, setConfig, logout } = useUser();
	const [input, setInput] = useState(config ? JSON.stringify(config, null, 4) : "");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const toast = useToast();

	useEffect(() => {
		if (!currentUser) {
			router.push("/login");
		}
	}, [currentUser]);

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		try {
			setError("");
			setLoading(true);
			const data = toObject(input);
			if (
				!data ||
				!data.apiKey ||
				!data.projectId ||
				!data.appId ||
				!data.authDomain ||
				!data.storageBucket
			) {
				throw new Error("One or more fields are missing from the config.");
			}

			await axios.post("/api/config", data);
			setConfig(data);
			window.localStorage.setItem(`fb_config_${currentUser.uid}`, JSON.stringify(data));

			toast({
				title: "Success",
				description: "Firebase credentials updated successfully.",
				status: "success",
				duration: 3000,
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
				w="md"
				px="6"
				pb="8"
				borderRadius="md"
				boxShadow="4.1px 4.1px 6.5px -1.7px rgba(0,0,0,0.2)"
			>
				<Flex align="center" justify="space-between">
					<Button
						variant="link"
						onClick={() => router.push("/")}
						leftIcon={<FontAwesomeIcon icon={faLongArrowAltLeft} />}
						_focus={{ outline: "none" }}
					>
						Home
					</Button>
					<Button
						variant="link"
						onClick={logout}
						leftIcon={<FontAwesomeIcon icon={faSignOutAlt} />}
						_focus={{ outline: "none" }}
					>
						Logout
					</Button>
				</Flex>
				<Text as="h2" fontSize="2xl" align="center" mt="8" mb="4">
					Paste your Firebase Credentials
				</Text>
				{error && (
					<Alert status="error" fontSize="md" mb="3">
						<AlertIcon />
						{error}
					</Alert>
				)}
				<Box as="form" onSubmit={handleSubmit}>
					<FormControl mb="3">
						<Textarea
							autoComplete="off"
							variant="outline"
							type="text"
							fontSize="sm"
							value={input}
							minH="200px"
							onChange={(e) => setInput(e.target.value)}
							required
							placeholder={`{
  apiKey: "AIzafeaubu13ub13j",
  authDomain: "myapp-f3190.firebaseapp.com",
  projectId: "myapp-f3190",
  storageBucket: "myapp-f3190.appspot.com",
  appId: "1:8931361818:web:132af17fejaj3695cf"
}`}
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
					<Text fontSize="xs">
						The fields <strong>apiKey</strong>, <strong>authDomain</strong>,{" "}
						<strong>projectId</strong>, <strong>storageBucket</strong> and <strong>appId</strong>{" "}
						must be present in the JSON.
					</Text>
				</Box>
			</Box>
		</CenterContainer>
	);
}
