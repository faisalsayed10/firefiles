import "@styles/index.css";
import axios from "axios";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import { SWRConfig } from "swr";

const ProgressBar = dynamic(() => import("@components/ProgressBar"), { ssr: false });

function MyApp({ Component, pageProps }) {
	return (
		<SWRConfig
			value={{
				fetcher: (url) => axios.get(url).then((res) => res.data),
				errorRetryCount: 1,
				onError: (err) => console.error(err),
			}}
		>
			<Component {...pageProps} />
			<Toaster position="bottom-right" />
			<ProgressBar />
		</SWRConfig>
	);
}

export default MyApp;
