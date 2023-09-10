import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
  Image,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { PROVIDERS } from "@util/globals";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { ArrowNarrowLeft } from "tabler-icons-react";

const New = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Create New Drive | Firefiles</title>
      </Head>
      <Flex px="16px" pt="3">
        <IconButton
          variant="ghost"
          aria-label="back"
          icon={<ArrowNarrowLeft />}
          mr="3"
          onClick={() => router.push("/")}
        />
        <Heading as="h3" size="lg">
          Add a new drive
        </Heading>
      </Flex>
      <Container display="flex" minH="90vh" alignItems="center">
        <Box flex="1" padding="5" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <SimpleGrid
            minChildWidth="120px"
            spacing="0px"
            spacingY="40px"
            placeItems="center"
            mb="4"
          >
            {PROVIDERS.map((p) => (
              <Flex
                key={p.id}
                pos="relative"
                flexDir="column"
                maxW="110px"
                maxH="110px"
                transition="ease-in-out 0.1s"
                cursor="pointer"
                className="hoverAnim"
                align="center"
                onClick={() => {
                  if (p.isComingSoon) return;
                  router.push(`/new/${p.id}`);
                }}
              >
                <Image src={p.logo} w="auto" h="72px" />
                <Text align="center" mt="2">
                  {p.name}
                </Text>
                {p.isComingSoon ? (
                  <Badge colorScheme="purple" pos="absolute" fontSize="xs" bottom="50%">
                    COMING SOON
                  </Badge>
                ) : null}
              </Flex>
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </>
  );
};

export default New;
