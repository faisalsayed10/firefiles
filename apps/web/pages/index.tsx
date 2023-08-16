import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Image,
  Skeleton,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import OptionsPopover from "@components/popups/OptionsPopover";
import AddDriveButton from "@components/ui/AddDriveButton";
import Navbar from "@components/ui/Navbar";
import useUser from "@hooks/useUser";
import { Drive } from "@prisma/client";
import { PROVIDERS } from "@util/globals";
import { deleteDrive } from "@util/helpers";
import { Provider } from "@util/types";
import gravatar from "gravatar";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { X } from "tabler-icons-react";
import useIndexedDB from "@hooks/useIndexedDB";

const Dashboard = () => {
  const router = useRouter();
  const { user } = useUser({ redirectTo: "/login" });
  const { data, isValidating, mutate } = useSWR<Drive[]>(`/api/drive`);
  const { deleteDbDrive } = useIndexedDB(); // import indexeddb hook

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
            {!data && isValidating ? (
              <>
                <Skeleton h="140px" w="full" borderRadius="lg" />
                <Skeleton h="140px" w="full" borderRadius="lg" />
                <Skeleton h="140px" w="full" borderRadius="lg" />
                <Skeleton h="140px" w="full" borderRadius="lg" />
              </>
            ) : (
              data?.map((drive) => (
                <Flex
                  key={drive.id}
                  cursor="pointer"
                  direction="column"
                  align="center"
                  borderRadius="lg"
                  boxShadow="5.5px 4.2px 7.8px -1.7px rgba(0, 0, 0, 0.1)"
                  w="100%"
                  h="140px"
                  borderWidth="1px"
                  transition="ease-in-out 0.1s"
                  className="hoverAnim"
                >
                  <Box flex={1} onClick={() => router.push(`/drives/${drive.id}`)} w="full" mt="2">
                    <Image
                      src={PROVIDERS.filter((p) => p.id === drive.type)[0].logo}
                      maxW="90px"
                      m="auto"
                    />
                  </Box>
                  <Flex p="2" w="full" justify="space-between" alignItems="center">
                    <Text
                      onClick={() => router.push(`/drives/${drive.id}`)}
                      flex="1"
                      isTruncated={true}
                      as="p"
                      fontSize="sm"
                      align="left"
                      px="2"
                    >
                      {drive.name}
                    </Text>
                    <OptionsPopover header={drive.name}>
                      <Flex alignItems="stretch" flexDirection="column">
                        <Flex
                          {...optionProps}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await deleteDrive(Provider[drive.type], drive.id);
                            await deleteDbDrive(drive.name);
                            mutate(data.filter((b) => b.id !== drive.id));
                          }}
                        >
                          <X />
                          <Text ml="2">Delete Drive</Text>
                        </Flex>
                      </Flex>
                    </OptionsPopover>
                  </Flex>
                </Flex>
              ))
            )}
            <AddDriveButton />
          </Grid>
        </Box>
      </Flex>
    </>
  );
};

export default Dashboard;
