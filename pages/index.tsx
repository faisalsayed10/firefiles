import { Box, Button, Divider, Flex, Grid, Image, Skeleton, Tag, Text } from "@chakra-ui/react";
import AddBucketButton from "@components/AddBucketButton";
import Navbar from "@components/Navbar";
import useUser from "@hooks/useUser";
import { PROVIDERS } from "@util/globals";
import { Bucket } from "@util/types";
import axios from "axios";
import gravatar from "gravatar";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Dashboard = () => {
	const [buckets, setBuckets] = useState<Bucket[]>([]);
	const [loading, setLoading] = useState(false);
	const { currentUser, loading: authLoading } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (authLoading) return;
		if (!currentUser) {
			router.push("/login");
		} else {
			(async () => {
				setLoading(true);
				const { data } = await axios.get("/api/get-buckets", {
					headers: { token: await currentUser.getIdToken() }
				});
				setBuckets(data.buckets);
				setLoading(false);
			})();
		}
	}, [currentUser, authLoading]);

	return (
		<>
			<Head>
				<title>Firefiles - Dashboard</title>
				<meta charSet="utf-8" />
			</Head>
			<Flex flexDir="column">
				<Navbar />
				<Flex my="4" flexDir={["column", "row", "row", "row"]} mx={["4", "8", "12"]}>
					<Image
						src={gravatar.url(currentUser?.email, { s: "110", protocol: "https" })}
						maxW="110px"
						maxH="110px"
						ml="4"
						borderRadius="50%"
					/>
					<Box ml="4">
						<Text as="h1" fontSize="2xl" fontWeight="semibold">
							👋 Hello There!
						</Text>
						<Flex align="baseline">
							<Text>
								<strong>Your Email:</strong> {currentUser?.email}
							</Text>
						</Flex>
						<Flex align="baseline">
							<strong>Current Plan: </strong>
							<Tag variant="solid" colorScheme="purple" ml="1">
								Free Plan
							</Tag>
							<Button variant="link" ml="1">
								Upgrade
							</Button>
						</Flex>
						<Button variant="link">View Payment Settings</Button>
					</Box>
				</Flex>
				<Divider />
				<Box mx={["4", "8", "12"]}>
					<Text as="h1" fontSize="3xl" fontWeight="600" my="3">
						Your Buckets
					</Text>
					<Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={6}>
						{loading ? (
							<>
								<Skeleton borderRadius="3px" />
								<Skeleton borderRadius="3px" />
								<Skeleton borderRadius="3px" />
								<Skeleton borderRadius="3px" />
							</>
						) : (
							buckets.map((bucket) => (
								<Box
									key={bucket.id}
									transition="ease-in-out 0.1s"
									cursor="pointer"
									className="hoverAnim"
									onClick={() => router.push(`/buckets/${bucket.id}`)}
								>
									<Image
										m="0 auto"
										src={PROVIDERS.filter((p) => p.id === bucket.type)[0].logo}
										h="110px"
									/>
								</Box>
							))
						)}
						<AddBucketButton />
					</Grid>
				</Box>
			</Flex>
		</>
	);
};

export default Dashboard;
