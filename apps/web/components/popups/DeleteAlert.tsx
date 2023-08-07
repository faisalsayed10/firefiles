import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import React from "react";
import { Role } from "@prisma/client";

const DeleteFileWarning: Record<Role, string> = {
  CREATOR:
    "Are you sure? This will remove your access (AND all the other users' aceess) to this resource. You can't undo this action afterwards.",
  ADMIN:
    "Are you sure? This will remove your access (AND all the other users' aceess) to this resource. You can't undo this action afterwards.",
  EDITOR:
    "Are you sure? This will remove your access (AND all the other users' aceess) to this resource. You can't undo this action afterwards.",
  VIEWER:
    "Are you sure? This will remove your access to this resource. You can't undo this action afterwards.",
};

interface Props {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  cancelRef: React.RefObject<any>;
  onClick: () => void;
}

const DeleteAlert: React.FC<Props> = ({ role, isOpen, onClick, onClose, cancelRef }) => {
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Files
          </AlertDialogHeader>

          <AlertDialogBody>{DeleteFileWarning[role]}</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onClick} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteAlert;
