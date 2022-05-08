import {
	Alert,
	AlertIcon,
	Box,
	Button,
	chakra,
	FormControl,
	Input,
	Link,
	Text,
} from "@chakra-ui/react";
import CenterContainer from "@components/ui/CenterContainer";
import useUser from "@hooks/useUser";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Head from "next/head";
import toast from "react-hot-toast";
const ForgotPassword = () => {
	const { reset } = useUser();
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setError("");
			setLoading(true);
			await reset(email);
			toast.success("Check your inbox! :)");
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		} catch (err) {
			setError(err.message);
		}

		setLoading(false);
	};

	return (
		<>
			{" "}
			<Head>
				<title>firefiles - Forgot Password</title>
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
						Reset Password
					</Text>
					{error && (
						<Alert status="error" fontSize="md">
							<AlertIcon />
							{error}
						</Alert>
					)}
					<Box as="form" onSubmit={handleSubmit}>
						<FormControl id="email" my="3">
							<Input
								variant="outline"
								placeholder="Enter your email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
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
							Reset
						</Button>
						<Text as="p" fontSize="xs" align="center">
							Don't have an account?{" "}
							<Link href="/signup">
								<chakra.span textDecor="underline" cursor="pointer">
									Sign Up
								</chakra.span>
							</Link>
						</Text>
					</Box>
				</Box>
			</CenterContainer>
		</>
	);
};

export default ForgotPassword;
