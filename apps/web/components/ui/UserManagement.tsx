import React, { useContext } from "react";
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
import useUser from "@hooks/useUser";
import { RoleContext } from "pages/drives/[id]";

const UserManagementModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user } = useUser();
  const role = useContext(RoleContext);

  if (router.query.id && (role === Role.CREATOR || role === Role.ADMIN)) {
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
          if (window.confirm("Are you sure you want to remove this user from this bucket?")) {
            await axios.delete(`/api/bucketsOnUsers?inviteeId=${id}&bucketId=${router.query.id}`);
            mutate(data.filter((b) => b.inviteeId !== id));
            toast.success("You have successfully removed this user to this bucket.");
            if (user.id === id) {
              router.push("/");
            }
          }
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
            data.map((bucketOnUser) => {
              if (bucketOnUser.inviteeId === id) {
                bucketOnUser.role = role;
              }
              return bucketOnUser;
            }),
          );
          toast.success("You have successfully changed this user's role.");
        } catch (error) {
          toast.error(error.response?.data?.error || error.message);
        }
      };

      return (
        <Modal size="xl" isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontSize="2xl">User Management</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <TableContainer>
                <Table variant="simple">
                  <Tbody>
                    <Tr>
                      <Th textAlign="center" fontSize="lg">
                        Existing User
                      </Th>
                      <Th textAlign="center" fontSize="lg">
                        Role
                      </Th>
                      <Th textAlign="center" fontSize="lg">
                        Delete
                      </Th>
                    </Tr>
                    {existingUsers.map((bucketOnUser, index) => (
                      <Tr key={index}>
                        <Td isTruncated maxW={"200px"}>
                          {bucketOnUser.inviteeEmail}
                        </Td>
                        <Td textAlign="center">{bucketOnUser.role}</Td>
                        <Td textAlign="center">
                          {bucketOnUser.role !== Role.CREATOR && (
                            <Button
                              size="sm"
                              onClick={() => handleRemoveAccess(bucketOnUser.inviteeId)}
                            >
                              <X size={20} strokeWidth={5} color={"#bf4044"} />
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    ))}
                    <Tr>
                      <Th textAlign="center" fontSize="lg">
                        Pending User
                      </Th>
                      <Th textAlign="center" fontSize="lg">
                        Role
                      </Th>
                      <Th textAlign="center" fontSize="lg">
                        Delete
                      </Th>
                    </Tr>
                    {pendingUsers.map((bucketOnUser, index) => (
                      <Tr key={index}>
                        <Td>{bucketOnUser.inviteeEmail}</Td>
                        <Td textAlign="center">{bucketOnUser.role}</Td>
                        <Td textAlign="center">
                          <Button onClick={() => handleRemoveAccess(bucketOnUser.inviteeId)}>
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
