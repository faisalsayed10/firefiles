import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx);
		return { ...initialProps };
	}

	render() {
		return (
			<Html>
				<Head>
					<link rel="icon" href="/firefiles-logo.png" type="image/png" />
					<meta name="title" content="Firefiles" />
					<meta name="description" content="Get your own file hosting service in minutes. Firefiles provides you with a drive like interface for your storage buckets." />
					<meta property="og:type" content="website" />
					<meta property="og:url" content="https://usefirefiles.vercel.app" />
					<meta property="og:title" content="Firefiles" />
					<meta property="og:description" content="Get your own file hosting service in minutes. Firefiles provides you with a drive like interface for your storage buckets." />
					<meta property="og:image" content="https://usefirefiles.vercel.app/firefiles-preview.png" />
					<meta property="twitter:card" content="summary_large_image" />
					<meta property="twitter:url" content="https://usefirefiles.vercel.app" />
					<meta property="twitter:title" content="Firefiles" />
					<meta
						property="twitter:description"
						content="Get your own file hosting service in minutes. Firefiles provides you with a drive like interface for your storage buckets."
					/>
					<meta
						property="twitter:image"
						content="https://usefirefiles.vercel.app/firefiles-preview.png"
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
