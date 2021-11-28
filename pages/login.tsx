import {
	Alert,
	AlertIcon,
	Box,
	Button,
	Center,
	FormControl, Input, Text
} from "@chakra-ui/react";
import CenterContainer from "@components/CenterContainer";
import Footer from "@components/Footer";
import useUser from "@util/useUser";
import axios from "axios";
import React, { useRef, useState } from "react";

export default function Login() {
	const { mutateUser } = useUser({ redirectTo: "/", redirectIfFound: true });
	const emailRef = useRef<HTMLInputElement>();
	const passwordRef = useRef<HTMLInputElement>();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setError("");
			setLoading(true);
			mutateUser(
				await axios.post("/api/login", {
					email: emailRef.current.value,
					password: passwordRef.current.value
				}).then((res) => res.data)
			);

		} catch (err) {
			console.error(err);
			setError(err.response.data.message);
		}

		setLoading(false);
	};

	return (
		<main>
			<CenterContainer>
				<Text fontSize="2xl" align="center" mb="2">
					Firefiles
				</Text>
				<Box w="sm" px="6" py="8" borderWidth="2px" borderRadius="md">
					<Text as="h2" fontSize="2xl" align="center" mb="8">
						👋 Login
					</Text>
					{error && (
						<Alert status="error">
							<AlertIcon />
							{error}
						</Alert>
					)}
					<Box as="form" onSubmit={handleSubmit}>
						<FormControl id="email" my="3">
							<Input
								variant="flushed"
								placeholder="Enter your email"
								type="email"
								ref={emailRef}
								required
							/>
						</FormControl>
						<FormControl id="password" mb="3">
							<Input
								variant="flushed"
								type="password"
								placeholder="Password"
								ref={passwordRef}
								required
							/>
						</FormControl>
						<Center>
							<Button
								colorScheme="cyan"
								variant="ghost"
								isLoading={loading}
								w="100"
								mt="4"
								type="submit">
								Login
							</Button>
						</Center>
					</Box>
				</Box>
			</CenterContainer>
			<Footer />
		</main>
	);
}
