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
import useSWR from "swr";
import { useRouter } from "next/router";
import { outgoingGetProp } from "pages/api/bucketsOnUsers";
import { Role } from "@prisma/client";
import axios from "axios";
import { toast } from "react-hot-toast";

const UserManagementModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (router.query.id) {
    const { data, isValidating, mutate } = useSWR<outgoingGetProp[]>(
      `/api/bucketsOnUsers?bucketId=${router.query.id}`,
    );

    if (!data && isValidating) {
      return <></>;
    } else {
      const existingUsers: outgoingGetProp[] = [];
      const pendingUsers: outgoingGetProp[] = [];

      data.forEach((bucketsOnUser) => {
        if (bucketsOnUser.isPending) {
          pendingUsers.push(bucketsOnUser);
        } else {
          existingUsers.push(bucketsOnUser);
        }
      });

      const handleRemoveAccess = async (id: string) => {
        try {
          await axios.delete(`/api/bucketsOnUsers?inviteeId=${id}&bucketId=${router.query.id}`);
          mutate(data.filter((user) => user.inviteeId !== id));
          toast.success("You have successfully removed this user to this bucket.");
          window.location.reload();
        } catch (error) {
          toast.error(error.message);
        }
      };

      const handleChangeRole = async (id: string, role: Role) => {
        try {
          await axios.put(`/api/bucketsOnUsers`, {
            bucketId: router.query.id,
            inviteeData: {
              role: role,
              userId: id,
            },
          });
          mutate(
            data.map((user) => {
              if (user.inviteeId === id) {
                user.role = role;
              }
              return user;
            }),
          );
          toast.success("You have successfully changed this user's role.");
        } catch (error) {
          toast.error(error.response?.data?.error || error.message);
        }
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
                      <Th>Existing User</Th>
                      <Th>Role</Th>
                      <Th>Delete</Th>
                      <Th></Th>
                    </Tr>
                    {existingUsers.map((user, index) => (
                      <Tr key={index}>
                        <Td>{user.inviteeEmail}</Td>
                        <Td>{user.role}</Td>
                        <Td>
                          {user.role !== Role.CREATOR && (
                            <Button onClick={() => handleRemoveAccess(user.inviteeId)}>
                              <X size={20} strokeWidth={5} color={"#bf4044"} />
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Table variant="simple">
                  <Tbody>
                    <Tr>
                      <Th>Pending User</Th>
                      <Th>Role</Th>
                      <Th>Delete</Th>
                    </Tr>
                    {pendingUsers.map((user, index) => (
                      <Tr key={index}>
                        <Td>{user.inviteeEmail}</Td>
                        <Td>{user.role}</Td>
                        <Td>
                          <Button onClick={() => handleRemoveAccess(user.inviteeId)}>
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
    }
  }
};
export default UserManagementModal;
