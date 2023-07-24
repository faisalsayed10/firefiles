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
          <link rel="icon" href="/logo.png" type="image/png" />
          <meta name="title" content="Firefiles" />
          <meta
            name="description"
            content="The open-source alternative to Dropbox. Firefiles gives you the freedom to bring your own cloud and provides you with a modern file-system interface."
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://beta.firefiles.app" />
          <meta property="og:title" content="Firefiles" />
          <meta
            property="og:description"
            content="The open-source alternative to Dropbox. Firefiles gives you the freedom to bring your own cloud and provides you with a modern file-system interface."
          />
          <meta property="og:image" content="https://beta.firefiles.app/firefiles-preview.png" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://beta.firefiles.app" />
          <meta property="twitter:title" content="Firefiles" />
          <meta
            property="twitter:description"
            content="The open-source alternative to Dropbox. Firefiles gives you the freedom to bring your own cloud and provides you with a modern file-system interface."
          />
          <meta
            property="twitter:image"
            content="https://beta.firefiles.app/firefiles-preview.png"
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
