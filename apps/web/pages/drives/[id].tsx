import Dashboard from "@components/Dashboard";
import { FirebaseProvider } from "@hooks/useFirebase";
import { KeysProvider } from "@hooks/useKeys";
import { S3Provider } from "@hooks/useS3";
import { SambaProvider } from "@hooks/useSamba";
import useUser from "@hooks/useUser";
import { Drive } from "@prisma/client";
import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { AES, enc } from "crypto-js";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type Props = {
  data: Drive;
};

const DrivePage: React.FC<Props> = ({ data }) => {
  const router = useRouter();
  const [folderPath, setFolderPath] = useState("");
  const { user } = useUser({ redirectTo: "/login" });

  useEffect(() => {
    const pathArray = router.asPath.split("/drives/")[1].split("/");
    setFolderPath(pathArray.slice(1).join("/"));
  }, [router.asPath]);

  return (
    <>
      <Head>
        <title>Your Files | Firefiles</title>
      </Head>
      <KeysProvider data={data}>
        {data.type === "firebase" ? (
          <FirebaseProvider data={data} fullPath={decodeURIComponent(folderPath)}>
            <Dashboard />
          </FirebaseProvider>
        ) : data.type === "s3" || data.type === "backblaze" || data.type === "cloudflare" || data.type === "wasabi" || data.type === "digitalocean" || data.type === "cloudflare" ? (
          <S3Provider data={data} fullPath={decodeURIComponent(folderPath)}>
            <Dashboard />
          </S3Provider>
        ) : data.type === "samba" ? (
          <SambaProvider data={data} fullPath={decodeURIComponent(folderPath)}>
            <Dashboard />
          </SambaProvider>
        ) : (
          <p>No provider found.</p>
        )}
      </KeysProvider>
    </>
  );
};

export const getServerSideProps = withIronSessionSsr(async ({ req, res, params }) => {
  try {
    const user = req.session.user;
    const id = params.id as string;
    if (!user?.email) throw new Error("User not logged in");

    const drive = await prisma.drive.findFirst({ where: { id, userId: user.id } });
    if (!drive?.keys) throw new Error("Drive not found");

    drive.keys = JSON.parse(AES.decrypt(drive.keys, process.env.CIPHER_KEY).toString(enc.Utf8));
    drive.createdAt = drive.createdAt.toString() as any;

    return { props: { data: drive } };
  } catch (err) {
    return { redirect: { permanent: false, destination: "/" }, props: {} };
  }
}, sessionOptions);

export default DrivePage;
