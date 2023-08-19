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
import { onLogout } from "@util/helpers";
import axios from "axios";
import { useRouter } from "next/router";
import React from "react";
import { ArrowNarrowLeft, ChevronDown, Coin, File, Logout, Moon, Sun } from "tabler-icons-react";

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { mutateUser } = useUser();
  const router = useRouter();

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
              <MenuItem
                icon={<File />}
                onClick={() => window.open("https://firefiles.app/docs", "_blank")}
              >
                View Documentation
              </MenuItem>
              <MenuItem
                icon={<Coin />}
                onClick={() => {
                  const url = "https://github.com/faisalsayed10/firefiles#sponsor-this-project";
                  window.open(url, "_blank");
                }}
              >
                Donate Us
              </MenuItem>
              <MenuItem
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
    </>
  );
}
