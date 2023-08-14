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
} from "@chakra-ui/react";
import { Bell } from "tabler-icons-react";
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { incomingGetProp } from "pages/api/bucketsOnUsers";
import axios from "axios";
import toast from "react-hot-toast";

const NotificationIcon = ({ count }) => {
  return (
    <div className="notification-icon">
      <Bell size={24} strokeWidth={1.5} />
      {count > 0 && <span className="notification-badge">{count}</span>}
    </div>
  );
};

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
              // fetchInvitationRequests(); // Fetch the requests again when the button is clicked
              onOpen();
            }}
          >
            <NotificationIcon count={data.length} />
          </Button>
          <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Invitation Requests</DrawerHeader>

              <DrawerBody>
                {data?.map((request, index) => (
                  <Flex justifyContent="space-between" key={index}>
                    Invite to Bucket {request.bucketName} as {request.role}
                    <div>
                      <Button
                        ml="2"
                        colorScheme="green"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await axios.patch(`/api/bucketsOnUsers?bucketId=${request.bucketId}`);
                            mutate(data.filter((b) => b.bucketId !== request.bucketId));
                            toast.success("You have successfully accepted the invitation");
                          } catch (error) {
                            toast.error("Something went wrong");
                          }
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        ml="2"
                        colorScheme="red"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await axios.delete(`/api/bucketsOnUsers?bucketId=${request.bucketId}`);
                            mutate(data.filter((b) => b.bucketId !== request.bucketId));
                            toast.success("You have successfully rejected the invitation");
                          } catch (error) {
                            toast.error("Something went wrong");
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </Flex>
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
