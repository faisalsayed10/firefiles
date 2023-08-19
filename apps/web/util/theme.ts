import { extendTheme } from "@chakra-ui/react";

const configOverrides = { useSystemColorMode: false, initialColorMode: "light" };

const theme = extendTheme({ configOverrides });

export default theme;
