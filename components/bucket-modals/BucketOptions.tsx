import { Badge, Flex, Image, SimpleGrid, Text } from '@chakra-ui/react';
import { PROVIDERS } from '@util/globals';
import { BucketType } from '@util/types';
import React from 'react';

const BucketOptions = ({ setSelectedType }) => {
  return (
		<SimpleGrid minChildWidth="120px" spacing="20px" spacingY="40px" placeItems="center" mb="4">
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
						setSelectedType(BucketType[p.id]);
					}}
				>
					<Image src={p.logo} w="auto" h="100px" />
					<Text align="center" mt="2">
						{p.name}
					</Text>
					{p.isComingSoon ? (
						<Badge colorScheme="purple" pos="absolute" fontSize="xs" bottom={0}>
							COMING SOON
						</Badge>
					) : null}
				</Flex>
			))}
		</SimpleGrid>
	);
};

export default BucketOptions;
