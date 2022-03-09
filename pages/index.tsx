import {
	Box,
	Button,
	Divider,
	Flex,
	Grid,
	IconButton,
	Image,
	Skeleton,
	Tag,
	Text,
} from "@chakra-ui/react";
import AddBucketButton from "@components/ui/AddBucketButton";
import Navbar from "@components/ui/Navbar";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useUser from "@hooks/useUser";
import { sendEvent } from "@util/firebase";
import { PROVIDERS } from "@util/globals";
import { deleteBucket } from "@util/helpers";
import { Bucket, BucketType } from "@util/types";
import axios from "axios";
import gravatar from "gravatar";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

const Dashboard = () => {
	const router = useRouter();
	const { currentUser, loading: authLoading } = useUser();
	const fetcher = async (key?: string) =>
		axios.get(key, { headers: { token: await currentUser.getIdToken() } }).then(({ data }) => data);
	const { data, error, isValidating, mutate } = useSWR<Bucket[]>(
		currentUser ? `/api/get-buckets` : null,
		fetcher,
		{ revalidateOnFocus: false, errorRetryCount: 1 }
	);

	useEffect(() => {
		if (authLoading) return;
		if (!currentUser) {
			router.push("/login");
		}
	}, [currentUser, authLoading]);

	if (error) toast.error("An error occurred while fetching buckets");

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
						{!data && isValidating ? (
							<>
								<Skeleton borderRadius="3px" />
								<Skeleton borderRadius="3px" />
								<Skeleton borderRadius="3px" />
								<Skeleton borderRadius="3px" />
							</>
						) : (
							data?.map((bucket) => (
								<Flex
									key={bucket.id}
									transition="ease-in-out 0.1s"
									align="center"
									pos="relative"
									cursor="pointer"
									className="hoverAnim"
									onClick={() => router.push(`/buckets/${bucket.id}`)}
								>
									<Image
										m="0 auto"
										src={PROVIDERS.filter((p) => p.id === bucket.type)[0].logo}
										h="80px"
									/>
									<IconButton
										colorScheme="red"
										pos="absolute"
										bottom="2"
										right="0"
										variant="link"
										aria-label="delete bucket"
										icon={<FontAwesomeIcon icon={faTrash} />}
										onClick={async (e) => {
											e.stopPropagation();
											await deleteBucket(
												BucketType[bucket.type],
												await currentUser.getIdToken(),
												bucket.id
											);

											mutate(data.filter((b) => b.id !== bucket.id));
											sendEvent("bucket_delete", {});
										}}
									/>
								</Flex>
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
