import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  useDisclosure,
  Box,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { Bell, Check, X } from "tabler-icons-react";
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { incomingGetProp } from "pages/api/bucketsOnUsers";
import axios from "axios";
import toast from "react-hot-toast";

export default function InviteNotification() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  const [invitationRequests, setInvitationRequests] = useState<string[]>([]);

  const { data, isValidating, mutate } = useSWR<incomingGetProp[]>(
    `/api/bucketsOnUsers?isPending=true`,
  );

  return (
    <>
      {!data && isValidating ? (
        <>{/*placeholder for content that is being loaded asynchronously.*/}</>
      ) : (
        <>
          <Button
            ref={btnRef}
            variant="ghost"
            onClick={() => {
              onOpen();
            }}
          >
            <Bell size={24} strokeWidth={1.5} />
          </Button>
          {data?.length > 0 ? (
            <Badge
              onClick={() => {
                onOpen();
              }}
              cursor="pointer"
              colorScheme="green"
              variant="solid"
              bgColor="green"
              pos="relative"
              right={5}
              top={-3}
            >
              {data.length}
            </Badge>
          ) : null}

          <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Invitation Inbox</DrawerHeader>

              <DrawerBody>
                <Divider />
                {data?.map((request, index) => (
                  <>
                    <Flex marginY="1" flexDir="row" justifyContent="space-between" key={index}>
                      <Flex flexDir="column">
                        <Box overflowWrap="anywhere">{request.bucketName}</Box>
                        <Box>Your access: {request.role}</Box>
                      </Flex>
                      <Flex alignItems="center">
                        <Button
                          ml="2"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await axios.patch(`/api/bucketsOnUsers`, {
                                bucketId: request.bucketId,
                              });
                              mutate(data.filter((b) => b.bucketId !== request.bucketId));
                              toast.success(
                                "You have successfully accepted the invitation. Refresh page to access.",
                              );
                            } catch (error) {
                              toast.error("Something went wrong");
                            }
                          }}
                        >
                          <Check size={20} strokeWidth={5} color={"#40bf4f"} />
                        </Button>
                        <Button
                          size="sm"
                          marginLeft="1"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await axios.delete(
                                `/api/bucketsOnUsers?bucketId=${request.bucketId}`,
                              );
                              mutate(data.filter((b) => b.bucketId !== request.bucketId));
                              toast.success("You have successfully rejected the invitation");
                            } catch (error) {
                              toast.error("Something went wrong");
                            }
                          }}
                        >
                          <X size={20} strokeWidth={5} color={"#bf4044"} />
                        </Button>
                      </Flex>
                    </Flex>
                    <Divider />
                  </>
                ))}
              </DrawerBody>

              <DrawerFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Done
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </>
  );
}
