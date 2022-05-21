import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import "@styles/index.css";
import theme from "@util/theme";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { SWRConfig } from "swr";

function MyApp({ Component, pageProps }) {
	return (
		<ChakraProvider resetCSS theme={theme}>
			<ColorModeScript initialColorMode={theme.config.initialColorMode} />
			<SWRConfig
				value={{
					fetcher: (url) => axios.get(url).then((res) => res.data),
					errorRetryCount: 1,
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
