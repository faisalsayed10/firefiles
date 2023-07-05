import React, { useState } from "react";
import { Box, Button, Container, Flex, Heading, Input, Text } from "@chakra-ui/react";
import useUser from "@hooks/useUser";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { ArrowNarrowLeft } from "tabler-icons-react";
import "video-react/dist/video-react.css";

const WasabiProvider = () => {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [bucketName, setBucketName] = useState("");

  const createBucket = async () => {
    setLoading(true);

    try {
      if (!user?.email) throw new Error("You need to login to perform this action!");

      if (!accessKey.trim() || !secretKey.trim() || !bucketName.trim())
        throw new Error("One or more fields are missing!");

      // Replace the API endpoint and request body with Wasabi
      const response = await axios.post("/api/wasabi/create-bucket", {
        accessKey,
        secretKey,
        bucketName,
      });

      toast.success("Drive created successfully!");
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || err.message);
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Wasabi | Firefiles</title>
      </Head>
      <Flex px="16px" pt="3">
        <IconButton
          variant="ghost"
          aria-label="back"
          icon={<ArrowNarrowLeft />}
          mr="3"
          onClick={() => router.push("/new")}
        />
        <Heading as="h3" size="lg">
          Enter your Wasabi keys
        </Heading>
      </Flex>
      <Container display="flex" minH="90vh" flexDir="column" justifyContent="center" maxW="lg">
        <Flex as="form" onSubmit={createBucket} flexDir="column" w="full">
          <Input
            mb="2"
            variant="flushed"
            placeholder="Access Key"
            type="text"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            required
          />
          <Input
            mb="2"
            variant="flushed"
            placeholder="Secret Key"
            type="text"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            required
          />
          <Input
            mb="2"
            variant="flushed"
            placeholder="Bucket Name"
            type="text"
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            required
          />
          <Button type="submit" isLoading={loading} colorScheme="green" variant="solid">
            Create
          </Button>
        </Flex>
      </Container>
    </>
  );
};

export default WasabiProvider;
