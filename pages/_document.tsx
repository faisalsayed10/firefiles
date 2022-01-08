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
					<meta name="title" content="firefiles" />
					<meta name="description" content="Get your own file hosting service in minutes." />
					<meta property="og:type" content="website" />
					<meta property="og:url" content="https://firefiles.vercel.app" />
					<meta property="og:title" content="firefiles" />
					<meta property="og:description" content="Get your own file hosting service in minutes." />
					<meta property="og:image" content="https://firefiles.vercel.app/firefiles-preview.png" />
					<meta property="twitter:card" content="summary_large_image" />
					<meta property="twitter:url" content="https://firefiles.vercel.app" />
					<meta property="twitter:title" content="firefiles" />
					<meta
						property="twitter:description"
						content="Get your own file hosting service in minutes."
					/>
					<meta
						property="twitter:image"
						content="https://firefiles.vercel.app/firefiles-preview.png"
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
