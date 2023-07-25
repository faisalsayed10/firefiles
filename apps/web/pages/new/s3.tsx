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
import AWSRegionSelect from "@components/ui/AWSRegionSelect";
import VideoModal from "@components/ui/VideoModal";
import useUser from "@hooks/useUser";
import { Role } from "@prisma/client";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowNarrowLeft } from "tabler-icons-react";
import "video-react/dist/video-react.css";

const NewS3 = () => {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [region, setRegion] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState("Not Selected");

  const listBuckets = async (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.email) throw new Error("You need to login to perform this action!");

      if (!accessKey.trim() || !secretKey.trim() || !region.trim())
        throw new Error("One or more fields are missing!");

      const { data } = await axios.post<ListBucketsCommandOutput>("/api/s3/list-buckets", {
        accessKey,
        secretKey,
        region,
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

      if (!accessKey.trim() || !secretKey.trim() || !region.trim())
        throw new Error("One or more fields are missing!");

      if (selectedBucket === "Not Selected" && !bucketName.trim())
        throw new Error("Select an existing bucket or enter a new bucket name!");

      if (
        (selectedBucket === "Not Selected" && bucketName.trim().length < 3) ||
        bucketName.trim().length > 63
      )
        throw new Error("Bucket name must be between 3 and 63 characters!");

      const Bucket = selectedBucket !== "Not Selected" ? selectedBucket : bucketName.trim();

      const createDrive = axios
        .post<{ driveId: string }>("/api/drive", {
          data: {
            accessKey,
            secretKey,
            Bucket,
            bucketUrl: `https://${Bucket}.s3.${region}.amazonaws.com`,
            region,
          },
          name: Bucket,
          type: "s3",
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
        <title>AWS S3 | Firefiles</title>
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
          Enter your AWS keys
        </Heading>
      </Flex>
      <Container display="flex" minH="90vh" flexDir="column" justifyContent="center" maxW="lg">
        <Flex as="form" onSubmit={listBuckets} flexDir="column" w="full">
          <Input
            mb="2"
            variant="flushed"
            placeholder="Access Key ID"
            type="text"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            required
          />
          <Input
            mb="2"
            variant="flushed"
            placeholder="Secret Access Key"
            type="text"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            required
          />
          <AWSRegionSelect value={region} onChange={(e) => setRegion(e.target.value)} />
          <VideoModal src="/aws-keys-tutorial.mov" />
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
