import { Box, Flex, Image, Text, Skeleton, Tooltip } from "@chakra-ui/react";
import OptionsPopover from "@components/popups/OptionsPopover";
import { Drive } from "@prisma/client";
import { PROVIDERS } from "@util/globals";
import { deleteDrive, detachDrive } from "@util/helpers";
import { Provider } from "@util/types";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { X, Share } from "tabler-icons-react";
import { Role } from "@prisma/client";
import toast from "react-hot-toast";

const tooltips: Record<Role, string> = {
  CREATOR: "You are the creator of this drive",
  ADMIN: "You are an administrator of this drive",
  VIEWER: "You are a viewer of this drive",
  EDITOR: "You are an editor of this drive",
};

const abbreviation: Record<Role, string> = {
  CREATOR: "C",
  ADMIN: "A",
  VIEWER: "V",
  EDITOR: "E",
};

const ShowRole: React.FC<{ driveRole: Role }> = ({ driveRole }) => (
  <Tooltip label={tooltips[driveRole]}>
    <Box position="absolute" top="0" right="2" bg="ghost" color="ghost" p="2" fontWeight="bold">
      {abbreviation[driveRole]}
    </Box>
  </Tooltip>
);

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
  const makeOnClickHandler = (id: string) => () => router.push(`/drives/${id}`);
  return (
    <>
      {!data && isValidating ? (
        <>
          {/*placeholder for content that is being loaded asynchronously.*/}
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
            <Box
              flex={1}
              onClick={makeOnClickHandler(drive.id)}
              w="full"
              mt="2"
              position="relative"
            >
              <Image
                src={PROVIDERS.filter((p) => p.id === drive.type)[0].logo}
                maxW="90px"
                m="auto"
              />
              <ShowRole driveRole={driveRole} />
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
                      try {
                        if (driveRole === Role.CREATOR) {
                          await deleteDrive(Provider[drive.type], drive.id);
                        } else {
                          await detachDrive(drive.id);
                        }
                        mutate(data.filter((b) => b.id !== drive.id));
                      } catch (e) {
                        toast.error(e.message);
                      }
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
