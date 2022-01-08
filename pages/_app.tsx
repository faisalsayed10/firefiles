import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { AuthProvider } from "@hooks/useUser";
import "@styles/index.css";
import theme from "@util/theme";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }) {
	return (
		<AuthProvider>
			<ChakraProvider resetCSS theme={theme}>
				<ColorModeScript initialColorMode={theme.config.initialColorMode} />
				<Component {...pageProps} />
				<Toaster position="bottom-right" />
			</ChakraProvider>
		</AuthProvider>
	);
}

export default MyApp;
