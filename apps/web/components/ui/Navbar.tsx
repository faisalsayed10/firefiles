import {
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react";
import useUser from "@hooks/useUser";
import { Role } from "@prisma/client";
import { onLogout } from "@util/helpers";
import axios from "axios";
import { useRouter } from "next/router";
import { RoleContext } from "pages/drives/[id]";
import React, { useContext, useState } from "react";
import {
  ArrowNarrowLeft,
  ChevronDown,
  Coin,
  File,
  Logout,
  Moon,
  Sun,
  User,
} from "tabler-icons-react";
import Invite from "./Invite";
import InviteNotification from "./InviteNotification";
import UserManagement from "./UserManagement";

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { mutateUser } = useUser();
  const router = useRouter();
  const role = useContext(RoleContext);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  const handleOpenUserManagementModal = () => {
    setIsUserManagementModalOpen(true);
  };

  const handleCloseUserManagementModal = () => {
    setIsUserManagementModalOpen(false);
  };
  return (
    <>
      <Flex
        align="center"
        justify={router.route !== "/" ? "space-between" : "end"}
        px="4"
        my="3"
        w="full"
      >
        {router.route !== "/" ? (
          <Button
            variant="link"
            leftIcon={<ArrowNarrowLeft />}
            fontWeight="bold"
            onClick={() => router.push("/")}
          >
            Dashboard
          </Button>
        ) : null}

        <Box>
          {router.route !== "/" && (role == Role.CREATOR || role == Role.ADMIN) && <Invite />}
          <InviteNotification />
          <IconButton
            aria-label="toggle color theme"
            size="md"
            variant="ghost"
            _focus={{ outline: "none" }}
            onClick={toggleColorMode}
            icon={colorMode === "light" ? <Moon size="16" /> : <Sun size="16" />}
          />
          <Menu>
            <MenuButton size="sm" as={Button} variant="ghost" rightIcon={<ChevronDown size="16" />}>
              Actions
            </MenuButton>
            <MenuList>
              {router.route !== "/" && (role == Role.CREATOR || role == Role.ADMIN) && (
                <MenuItem height="8" icon={<User />} onClick={handleOpenUserManagementModal}>
                  User Management
                </MenuItem>
              )}
              <MenuItem
                height="8"
                icon={<File />}
                onClick={() => window.open("https://firefiles.app/docs", "_blank")}
              >
                View Documentation
              </MenuItem>
              <MenuItem
                height="8"
                icon={<Coin />}
                onClick={() => {
                  const url = "https://github.com/faisalsayed10/firefiles#sponsor-this-project";
                  window.open(url, "_blank");
                }}
              >
                Donate Us
              </MenuItem>
              <MenuItem
                height="8"
                icon={<Logout />}
                onClick={async () => {
                  await onLogout();
                  await axios.get("/api/auth/logout");
                  mutateUser(null, false);
                  router.push("/login");
                }}
              >
                Log Out
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
      <Divider />
      <UserManagement isOpen={isUserManagementModalOpen} onClose={handleCloseUserManagementModal} />
    </>
  );
}
