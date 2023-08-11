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
// import { BellIcon } from "@chakra-ui/icons";
import React, { useState, useEffect } from "react";

export default function InviteNotification() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  const [invitationRequests, setInvitationRequests] = useState<string[]>([]);

  // Simulate fetching invitation requests from the backend
  const fetchInvitationRequests = () => {
    // Need to replace with the actual API call to fetch the requests
    const mockRequests = ["request 1", "2", "3"];
    setInvitationRequests(mockRequests);
  };

  useEffect(() => {
    fetchInvitationRequests();
  }, []);

  const acceptRequest = (index: number) => {
    const updatedRequests = invitationRequests.filter((_, i) => i !== index);
    setInvitationRequests(updatedRequests);
  };

  const rejectRequest = (index: number) => {
    const updatedRequests = invitationRequests.filter((_, i) => i !== index);
    setInvitationRequests(updatedRequests);
  };

  return (
    <>
      <Button
        ref={btnRef}
        variant="ghost"
        onClick={() => {
          fetchInvitationRequests(); // Fetch the requests again when the button is clicked
          onOpen();
        }}
      >
        {/* <BellIcon /> */}
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Invitation Requests</DrawerHeader>

          <DrawerBody>
            {invitationRequests.map((request, index) => (
              <Flex justifyContent="space-between" key={index}>
                {request}
                <div>
                  <Button ml="2" colorScheme="green" size="sm" onClick={() => acceptRequest(index)}>
                    Accept
                  </Button>
                  <Button ml="2" colorScheme="red" size="sm" onClick={() => rejectRequest(index)}>
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
  );
}
