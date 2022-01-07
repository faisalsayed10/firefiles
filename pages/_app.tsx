import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import "@styles/index.css";
import theme from "@util/theme";
import { AuthProvider } from "@hooks/useUser";
import { AppProvider } from "@hooks/useApp";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }) {
	return (
		<ChakraProvider resetCSS theme={theme}>
			<ColorModeScript initialColorMode={theme.config.initialColorMode} />
			<AuthProvider>
				<AppProvider>
					<Component {...pageProps} />
					<Toaster position="bottom-right" />
				</AppProvider>
			</AuthProvider>
		</ChakraProvider>
	);
}

export default MyApp;
