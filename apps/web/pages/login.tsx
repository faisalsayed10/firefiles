import {
  Button,
  Flex,
  FormControl,
  Heading,
  Image,
  Input,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import useInterval from "@hooks/useInterval";
import useUser from "@hooks/useUser";
import axios from "axios";
import Head from "next/head";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
  const { mutateUser } = useUser({ redirectTo: "/", redirectIfFound: true });
  const { colorMode } = useColorMode();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeGap, setTimeGap] = useState(0);

  useInterval(
    () => {
      setTimeGap(timeGap - 1);
    },
    timeGap > 0 ? 1000 : null,
  );

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/login", { email });

      toast.success(data.message);
      setTimeGap(30);
    } catch (err) {
      toast.error(err.response.data.error || err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Login | Firefiles</title>
      </Head>
      <Flex
        className={colorMode === "light" ? "auth-background" : ""}
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
            disabled={!email || timeGap > 0}
            isLoading={loading}
            w="full"
            height="60px"
            borderRadius="100px"
            type="submit"
          >
            Log in
          </Button>
          {timeGap > 0 && (
            <Text fontSize="sm">Please wait {timeGap} seconds before trying again.</Text>
          )}
        </Flex>
      </Flex>
    </>
  );
}
