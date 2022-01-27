import { Alert, AlertIcon, Box, Button, chakra, FormControl, Input, Text } from "@chakra-ui/react";
import CenterContainer from "@components/CenterContainer";
import useApp from "@hooks/useApp";
import useUser from "@hooks/useUser";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function Signup() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { signup, currentUser, loading: authLoading } = useUser();
	const { config } = useApp();
	const router = useRouter();

	useEffect(() => {
		if (loading || authLoading) return;
		if (currentUser && config) {
			router.push("/");
		} else if (currentUser) {
			router.push("/config");
		}
	}, [currentUser, config, loading, authLoading]);

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		if (!password || !confirmPassword || !email) return;
		if (password !== confirmPassword) {
			return setError("Passwords do not match");
		}

		try {
			setError("");
			setLoading(true);
			await signup(email, password);
		} catch (err) {
			setError(err.message.replace("Firebase: ", ""));
		}
		setLoading(false);
	};

	return (
		<>
			<Head>
				<title>firefiles - Signup</title>
			</Head>
			<CenterContainer>
				<Box
					w="sm"
					px="6"
					py="8"
					borderRadius="md"
					boxShadow="4.1px 4.1px 6.5px -1.7px rgba(0,0,0,0.2)"
				>
					<Text as="h2" fontSize="2xl" align="center" mb="8">
						👋 Sign Up
					</Text>
					{error && (
						<Alert status="error" fontSize="md">
							<AlertIcon />
							{error}
						</Alert>
					)}
					<Box as="form" onSubmit={handleSubmit}>
						<FormControl my="3" id="email">
							<Input
								variant="outline"
								placeholder="Enter your email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</FormControl>
						<FormControl mb="3" id="password">
							<Input
								variant="outline"
								placeholder="Password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</FormControl>
						<FormControl mb="3" id="password-confirm">
							<Input
								variant="outline"
								placeholder="Confirm your password"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
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
							Sign Up
						</Button>
						<Text as="p" fontSize="xs" align="center">
							Already have an account?{" "}
							<Link href="/login">
								<chakra.span textDecor="underline" cursor="pointer">
									Log In
								</chakra.span>
							</Link>
						</Text>
					</Box>
				</Box>
			</CenterContainer>
		</>
	);
}
