import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import "@styles/index.css";
import theme from "@util/theme";
import { AuthProvider } from "@util/useUser";

function MyApp({ Component, pageProps }) {
	return (
		<ChakraProvider resetCSS theme={theme}>
			<ColorModeScript initialColorMode={theme.config.initialColorMode} />
			<AuthProvider>
				<Component {...pageProps} />
			</AuthProvider>
		</ChakraProvider>
	);
}

export default MyApp;
