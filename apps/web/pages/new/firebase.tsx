import {
  Alert,
  AlertIcon,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Textarea,
} from "@chakra-ui/react";
import VideoModal from "@components/ui/VideoModal";
import useUser from "@hooks/useUser";
import { Role } from "@prisma/client";
import axios from "axios";
import toObject from "convert-to-object";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowNarrowLeft } from "tabler-icons-react";
import "video-react/dist/video-react.css";

const jsonPlaceholder = `{
  apiKey: "AIzafeaubu13ub13j",
  authDomain: "myapp-f3190.firebaseapp.com",
  projectId: "myapp-f3190",
  storageBucket: "myapp-f3190.appspot.com",
  appId: "1:8931361818:web:132af17fejaj3695cf"
}`;

const NewFirebase = () => {
  const [raw, setRaw] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createBucket = async (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.email) throw new Error("You need to login to perform this action!");

      const data = toObject(raw);
      if (
        !data ||
        !data.apiKey ||
        !data.projectId ||
        !data.appId ||
        !data.authDomain ||
        !data.storageBucket
      )
        throw new Error("One or more fields are missing!");

      const createDrive = axios
        .post<{ driveId: string }>("/api/drive", { data, name: data.projectId, type: "firebase" })
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
      toast.error(err.message);
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Firebase | Firefiles</title>
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
          Paste your Firebase config
        </Heading>
      </Flex>
      <Container display="flex" minH="90vh" alignItems="center" maxW="lg">
        <Flex as="form" onSubmit={createBucket} flexDir="column" w="full">
          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            minH="200px"
            placeholder={jsonPlaceholder}
            required
          />
          <Alert status="info" mt="2">
            <AlertIcon />
            <span>
              Make sure you've followed all the{" "}
              <a
                href="https://firefiles.app/docs/firebase/01-setup"
                target="_blank"
                style={{ textDecoration: "underline" }}
              >
                steps!
              </a>
            </span>
          </Alert>
          <VideoModal src="/firebase-config-tutorial.mov" />
          <Button
            type="submit"
            isLoading={loading}
            loadingText="Creating"
            colorScheme="green"
            variant="solid"
          >
            Create
          </Button>
        </Flex>
      </Container>
    </>
  );
};

export default NewFirebase;
