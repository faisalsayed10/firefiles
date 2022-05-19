import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = { useSystemColorMode: false, initialColorMode: "light" };

const theme = extendTheme({ config });

export default theme;
