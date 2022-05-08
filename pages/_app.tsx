import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import "@styles/index.css";
import theme from "@util/theme";
import { Toaster } from "react-hot-toast";
import { SWRConfig } from "swr";

function MyApp({ Component, pageProps }) {
	return (
		<ChakraProvider resetCSS theme={theme}>
			<ColorModeScript initialColorMode={theme.config.initialColorMode} />
			<SWRConfig
				value={{
					fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
					onError: (err) => console.error(err),
				}}
			>
				<Component {...pageProps} />
				<Toaster position="bottom-right" />
			</SWRConfig>
		</ChakraProvider>
	);
}

export default MyApp;
