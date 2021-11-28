import { Alert, AlertIcon, Box, Button, Center, Text } from "@chakra-ui/react";
import CenterContainer from "@components/CenterContainer";
import Footer from "@components/Footer";
import useUser from "@util/useUser";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function Profile() {
	const [error, setError] = useState("");
	const router = useRouter();
	const { user, mutateUser } = useUser({ redirectTo: "/login" });

	async function handleLogout() {
		setError("");

		try {
			mutateUser(await axios.get("/api/logout").then((res) => res.data));
		} catch {
			setError("Failed to log out");
		}
	}

	return (
		<CenterContainer>
			<Box px="6" pt="8" borderWidth="2px" borderRadius="md">
				<Text as="h2" fontSize="2xl" align="center" mb="4">
					Profile
				</Text>
				{error && (
					<Alert status="error">
						<AlertIcon />
						{error}
					</Alert>
				)}
				<strong>Currently logged in as:</strong> {user?.email}
				<Text fontSize="sm" align="center" mb="4" mt="6">
					To update your credentials, please go to your deployment settings and change the
					environment variables.
				</Text>
			</Box>
			<Box as="div" w="100" textAlign="center">
				<Center>
					<Button colorScheme="cyan" variant="ghost" mt="4" onClick={() => router.push("/")}>
						Home
					</Button>
					<Button colorScheme="cyan" variant="ghost" mt="4" onClick={handleLogout}>
						Log Out
					</Button>
				</Center>
			</Box>
			<Footer />
		</CenterContainer>
	);
}
