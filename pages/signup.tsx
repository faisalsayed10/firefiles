import { Alert, AlertIcon, Box, Button, chakra, FormControl, Input, Text } from "@chakra-ui/react";
import CenterContainer from "@components/CenterContainer";
import useUser from "@util/useUser";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

export default function Signup() {
	const emailRef = useRef<HTMLInputElement>();
	const passwordRef = useRef<HTMLInputElement>();
	const passwordConfirmRef = useRef<HTMLInputElement>();
	const { signup, currentUser } = useUser();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (currentUser) {
			window.location.href = "/";
		}
	}, [currentUser]);

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		if (!passwordRef.current || !passwordConfirmRef.current || !emailRef) return;
		if (passwordRef.current.value !== passwordConfirmRef.current.value) {
			return setError("Passwords do not match");
		}

		try {
			setError("");
			setLoading(true);
			await signup(emailRef.current.value, passwordRef.current.value);
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
							ref={emailRef}
							required
						/>
					</FormControl>
					<FormControl mb="3" id="password">
						<Input
							variant="outline"
							placeholder="Password"
							type="password"
							ref={passwordRef}
							required
						/>
					</FormControl>
					<FormControl mb="3" id="password-confirm">
						<Input
							variant="outline"
							placeholder="Confirm your password"
							type="password"
							ref={passwordConfirmRef}
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
					<Text as="p" fontSize="xs">
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
	);
}
