import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Tr,
  TableContainer,
} from "@chakra-ui/react";
import { X } from "tabler-icons-react";

const UserManagementModal = ({ isOpen, onClose }) => {
  // Mock data for demonstration
  const existingUsers = [
    { email: "user1@example.com", role: "Editor" },
    { email: "user2@example.com", role: "Admin" },
  ];

  const pendingUsers = [
    { email: "qwq@example.com", role: "Viewer" },
    { email: "qwq2@example.com", role: "Admin" },
  ];

  const handleRemoveAccess = (userEmail) => {
    // Handle the logic to remove user access
  };
  return (
    <Modal size="lg" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>User Management</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TableContainer>
            <Table variant="simple">
              <Tbody>
                <Tr>
                  <Th>Pending User Email</Th>
                  <Th>Role</Th>
                  <Th>Delete</Th>
                  <Th></Th>
                </Tr>
                {existingUsers.map((user, index) => (
                  <Tr key={index}>
                    <Td>{user.email}</Td>
                    <Td>{user.role}</Td>
                    <Td>
                      <Button onClick={() => handleRemoveAccess(user.email)}>
                        <X size={20} strokeWidth={5} color={"#bf4044"} />
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Table variant="simple">
              <Tbody>
                <Tr>
                  <Th>Existing User Email</Th>
                  <Th>Role</Th>
                  <Th>Delete</Th>
                </Tr>
                {pendingUsers.map((user, index) => (
                  <Tr key={index}>
                    <Td>{user.email}</Td>
                    <Td>{user.role}</Td>
                    <Td>
                      <Button onClick={() => handleRemoveAccess(user.email)}>
                        <X size={20} strokeWidth={5} color={"#bf4044"} />
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>
        <ModalFooter>{/* Add any footer content or buttons if needed */}</ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserManagementModal;
