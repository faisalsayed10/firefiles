import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { Role } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import validator from "validator";

export default function Invite() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = React.useState("");
  const [isValidEmail, setIsValidEmail] = React.useState(true);
  const [selectedRole, setSelectedRole] = React.useState<Role>(null);
  const router = useRouter();

  const handleShare = async () => {
    if (validator.isEmail(email)) {
      try {
        const { data } = await axios.post("/api/bucketsOnUsers", {
          email: email,
          bucketId: router.query.id,
          role: selectedRole,
        });

        onClose();
        toast.success(data.message);
      } catch (error) {
        toast.error(error.message);
      }
    } else {
      // Invalid email, show an error or take appropriate action
      setIsValidEmail(false);
    }
  };
  const handleSelectChange = (event: { target: { value: React.SetStateAction<String> } }) => {
    setSelectedRole(event.target.value as Role);
  };
  const isFormValid = selectedRole !== null;

  return (
    <>
      <Button variant="ghost" fontWeight="normal" onClick={onOpen}>
        Share
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setIsValidEmail(true);
        }}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Drive</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!isValidEmail}
              />
            </FormControl>
            <Select
              isRequired
              marginTop="3"
              width="fit-content"
              placeholder="Select Role"
              isInvalid={!isFormValid}
              value={selectedRole}
              onChange={handleSelectChange}
            >
              <option value={Role.ADMIN}>{Role.ADMIN}</option>
              <option value={Role.EDITOR}>{Role.EDITOR}</option>
              <option value={Role.VIEWER}>{Role.VIEWER}</option>
            </Select>
            {!isFormValid && <span style={{ color: "crimson" }}>Please select a role.</span>}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" ml={3} onClick={handleShare}>
              Share
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
