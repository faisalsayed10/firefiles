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
import React from "react";
import validator from "validator";

export default function Invite() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = React.useState("");
  const [isValidEmail, setIsValidEmail] = React.useState(true);
  const [selectedRole, setSelectedRole] = React.useState("");

  const handleShare = () => {
    if (validator.isEmail(email)) {
      // Valid email, perform sharing logic
      // e.g., send email or share the file
      onClose();
    } else {
      // Invalid email, show an error or take appropriate action
      setIsValidEmail(false);
    }
  };
  const handleSelectChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSelectedRole(event.target.value);
  };
  const isFormValid = selectedRole !== "";

  return (
    <>
      <Button variant="ghost" fontWeight="normal" onClick={onOpen}>
        Invite
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
              <option value="option1">Administer</option>
              <option value="option2">Editor</option>
              <option value="option3">Viewer</option>
            </Select>
            {!isFormValid && <span style={{ color: "crimson" }}>Please select a role.</span>}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" ml={3}>
              Share
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
