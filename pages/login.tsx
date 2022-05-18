import { Button, Flex, FormControl, Heading, Image, Input, Text } from "@chakra-ui/react";
import useUser from "@hooks/useUser";
import { User } from "@prisma/client";
import axios from "axios";
import Head from "next/head";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
	const { mutateUser } = useUser({ redirectTo: "/", redirectIfFound: true });
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		try {
			setLoading(true);
			const { data } = await axios.post("/api/auth/login", { email });

			toast.success(data);
		} catch (err) {
			toast.error(err.response.data.error || err.message);
		}
		setLoading(false);
	};

	return (
		<>
			<Head>
				<title>Firefiles - Login</title>
			</Head>
			<Flex
				className="auth-background"
				direction="column"
				align="center"
				justify="center"
				minH="100vh"
			>
				<Image src="/logo.png" w="100px" />
				<Flex as="form" onSubmit={handleSubmit} align="center" direction="column" py="4">
					<Heading as="h1" size="2xl" mb="2">
						Welcome back
					</Heading>
					<Text color="gray.600" mb="8">
						Login or Signup to Firefiles
					</Text>
					<FormControl id="email" mb="4">
						<Input
							w={["300px", "370px", "370px"]}
							h="50px"
							variant="outline"
							placeholder="john@example.com"
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
						disabled={!email}
						isLoading={loading}
						w="full"
						height="60px"
						borderRadius="100px"
						type="submit"
					>
						Log in
					</Button>
				</Flex>
			</Flex>
		</>
	);
}
