import { Bucket, ListBucketsCommandOutput } from "@aws-sdk/client-s3";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  Select,
  Text,
} from "@chakra-ui/react";
import VideoModal from "@components/ui/VideoModal";
import useUser from "@hooks/useUser";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowNarrowLeft } from "tabler-icons-react";
import "video-react/dist/video-react.css";
import validator from "validator";
import { Role } from "@prisma/client";

const NewS3 = () => {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [keyId, setKeyId] = useState("");
  const [applicationKey, setApplicationKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState("Not Selected");

  const listBuckets = async (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.email) throw new Error("You need to login to perform this action!");

      if (!keyId.trim() || !applicationKey.trim() || !endpoint.trim())
        throw new Error("One or more fields are missing!");

      if (
        !validator.isURL(endpoint, { require_protocol: true, protocols: ["https"] }) ||
        !/^(https:\/\/s3\.).+(\.backblazeb2.com)$/g.test(endpoint)
      )
        throw new Error("Endpoint URL does not match the required format!");

      const { data } = await axios.post<ListBucketsCommandOutput>("/api/s3/list-buckets", {
        accessKey: keyId,
        secretKey: applicationKey,
        endpoint,
        region: endpoint.split(".")[1],
      });

      setBuckets(data.Buckets);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || err.message);
    }

    setLoading(false);
  };

  const createBucket = async () => {
    setLoading(true);

    try {
      if (!user?.email) throw new Error("You need to login to perform this action!");

      if (!keyId.trim() || !applicationKey.trim())
        throw new Error("One or more fields are missing!");

      if (
        !validator.isURL(endpoint, { require_protocol: true, protocols: ["https"] }) ||
        !/^(https:\/\/s3\.).+(\.backblazeb2.com)$/g.test(endpoint)
      )
        throw new Error("Endpoint URL does not match the required format!");

      if ((selectedBucket === "Not Selected" && !bucketName.trim()) || !endpoint.trim())
        throw new Error("Select an existing bucket or enter a new bucket name!");

      if (
        (selectedBucket === "Not Selected" && bucketName.trim().length < 3) ||
        bucketName.trim().length > 63
      )
        throw new Error("Bucket name must be between 3 and 63 characters!");

      const Bucket = selectedBucket !== "Not Selected" ? selectedBucket : bucketName.trim();

      const createDrive = axios
        .post("/api/drive", {
          data: {
            accessKey: keyId,
            secretKey: applicationKey,
            Bucket,
            bucketUrl: `https://${Bucket}.s3.${endpoint.split(".")[1]}.backblazeb2.com`,
            endpoint,
            region: endpoint.split(".")[1],
          },
          name: Bucket,
          type: "backblaze",
        })
        .then(({ data: driveId }) =>
          axios.post("/api/bucketsOnUsers", {
            id: driveId,
            userId: user.id,
            isPending: false,
            role: Role.CREATOR,
          }),
        );

      toast.promise(createDrive, {
        loading: "Creating drive...",
        success: "Drive created successfully.",
        error: "An error occurred while creating the drive.",
      });

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
        <title>Backblaze | Firefiles</title>
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
          Enter your Backblaze keys
        </Heading>
      </Flex>
      <Container display="flex" minH="90vh" flexDir="column" justifyContent="center" maxW="lg">
        <Flex as="form" onSubmit={listBuckets} flexDir="column" w="full">
          <Input
            mb="2"
            variant="flushed"
            placeholder="Key ID"
            type="text"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            required
          />
          <Input
            mb="2"
            variant="flushed"
            placeholder="Application Key"
            type="text"
            value={applicationKey}
            onChange={(e) => setApplicationKey(e.target.value)}
            required
          />
          <Input
            mb="2"
            variant="flushed"
            placeholder="Endpoint - https://s3.<your-region>.backblazeb2.com"
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            required
          />
          <VideoModal src="/backblaze-keys-tutorial.mov" />
          <Button type="submit" isLoading={loading} colorScheme="green" variant="solid">
            Next
          </Button>
        </Flex>
        {buckets?.length > 0 ? (
          <>
            <Divider my="6" />
            <Box>
              <Heading as="h4" size="md" mb="2">
                Found {buckets.length} buckets:
              </Heading>
              <Text fontSize="sm">Choose a bucket:</Text>
              <Select value={selectedBucket} onChange={(e) => setSelectedBucket(e.target.value)}>
                <option>Not Selected</option>
                {buckets.map((bucket) => (
                  <option key={bucket.CreationDate.toString()} value={bucket.Name}>
                    {bucket.Name}
                  </option>
                ))}
              </Select>
              <Text fontSize="lg" align="center" my="2">
                OR
              </Text>
              <Text fontSize="sm">Create New:</Text>
              <Input
                mb="2"
                variant="flushed"
                placeholder="Bucket Name"
                type="text"
                value={bucketName}
                onChange={(e) => {
                  // Bucket name must not contain spaces or uppercase letters
                  const text = e.target.value.replace(" ", "").toLowerCase();
                  setBucketName(text);
                }}
                required
              />
              <Button
                mt="2"
                w="full"
                isLoading={loading}
                onClick={createBucket}
                colorScheme="green"
                variant="solid"
              >
                Create
              </Button>
            </Box>
          </>
        ) : null}
      </Container>
    </>
  );
};

export default NewS3;
