import { Box, Flex, Image, Text, Skeleton } from "@chakra-ui/react";
import OptionsPopover from "@components/popups/OptionsPopover";
import { Drive } from "@prisma/client";
import { PROVIDERS } from "@util/globals";
import { deleteDrive } from "@util/helpers";
import { Provider } from "@util/types";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { X } from "tabler-icons-react";
import { Role } from "@prisma/client";

interface Props {
  optionProps: {
    p: number;
    cursor: string;
    _hover: {
      backgroundColor: string;
    };
  };
  driveRole: Role;
}

const Drives: React.FC<Props> = ({ optionProps, driveRole }) => {
  const router = useRouter();
  const { data, isValidating, mutate } = useSWR<Drive[]>(
    `/api/drive?role=${driveRole}&isPending=false`,
  );

  return (
    <>
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
                {driveRole === Role.CREATOR ? drive.name : `${driveRole} ${drive.name}`}
              </Text>
              <OptionsPopover header={drive.name}>
                <Flex alignItems="stretch" flexDirection="column">
                  <Flex
                    {...optionProps}
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deleteDrive(Provider[drive.type], drive.id);
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
    </>
  );
};

export default Drives;
