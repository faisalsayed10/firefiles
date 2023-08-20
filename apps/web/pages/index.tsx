import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Image,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Drives from "@components/drives/Drives";
import AddDriveButton from "@components/ui/AddDriveButton";
import Navbar from "@components/ui/Navbar";
import useUser from "@hooks/useUser";
import { Role } from "@prisma/client";
import gravatar from "gravatar";
import Head from "next/head";
import React from "react";

const Dashboard = () => {
  const { user } = useUser({ redirectTo: "/login" });

  const optionProps = {
    p: 2,
    cursor: "pointer",
    _hover: { backgroundColor: useColorModeValue("gray.100", "rgba(237, 242, 247, 0.1)") },
  };

  return (
    <>
      <Head>
        <title>Your Drives | Firefiles</title>
        <meta charSet="utf-8" />
      </Head>
      <Flex flexDir="column">
        <Navbar />
        <Flex my="4" flexDir={["column", "row", "row", "row"]} mx={["4", "8", "12"]}>
          <Image
            src={gravatar.url(user?.email, {
              s: "110",
              protocol: "https",
            })}
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
                <strong>Your Email:</strong> {user?.email}
              </Text>
            </Flex>
            <Flex align="baseline">
              <strong>Current Plan: </strong>
              <Tag variant="solid" colorScheme="purple" ml="1">
                {user?.plan} Plan
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
            Your Drives
          </Text>
          <Grid
            templateColumns={[
              "repeat(auto-fill, minmax(140px, 1fr))",
              "repeat(auto-fill, minmax(160px, 1fr))",
              "repeat(auto-fill, minmax(160px, 1fr))",
            ]}
            gap={[2, 6, 6]}
          >
            <Drives optionProps={optionProps} driveRole={Role.CREATOR} />
            <AddDriveButton />
          </Grid>
        </Box>
        <Divider marginTop={"8"} />
        <Box mx={["4", "8", "12"]}>
          <Text as="h1" fontSize="3xl" fontWeight="600" my="3">
            Shared With Me
          </Text>
          <Grid
            templateColumns={[
              "repeat(auto-fill, minmax(140px, 1fr))",
              "repeat(auto-fill, minmax(160px, 1fr))",
              "repeat(auto-fill, minmax(160px, 1fr))",
            ]}
            gap={[2, 6, 6]}
          >
            {[Role.ADMIN, Role.EDITOR, Role.VIEWER].map((role, index) => (
              <Drives key={index} optionProps={optionProps} driveRole={role} />
            ))}
          </Grid>
        </Box>
      </Flex>
    </>
  );
};

export default Dashboard;
