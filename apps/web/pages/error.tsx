import { Alert, AlertIcon, Box, Button, Link, Text } from "@chakra-ui/react";
import CenterContainer from "@components/ui/CenterContainer";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

const Error = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Something Went Wrong | Firefiles</title>
      </Head>
      <CenterContainer>
        <Box w="md" px="6" py="8">
          <Text as="h2" fontSize="2xl" align="center" mb="3">
            An Unexpected Error Occurred
          </Text>
          <Alert status="error" fontSize="md" mb="6">
            <AlertIcon />
            {router.query.message}
          </Alert>
          <Text as="p" align="center" fontSize="sm" textDecor="underline" cursor="pointer" mb="1">
            <Link href="https://firefiles.app/docs" target="_blank">
              Make sure you're not missing anything
            </Link>
          </Text>
          <Button mb="1" variant="solid" w="full" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </Box>
      </CenterContainer>
    </>
  );
};

export default Error;
