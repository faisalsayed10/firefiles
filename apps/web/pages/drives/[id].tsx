import Dashboard from "@components/Dashboard";
import { FirebaseProvider } from "@hooks/useFirebase";
import { KeysProvider } from "@hooks/useKeys";
import { S3Provider } from "@hooks/useS3";
import { S3SharedProvider } from "@hooks/sharedBuckets/useS3Shared";
import useUser from "@hooks/useUser";
import { Drive, Role } from "@prisma/client";
import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { AES, enc } from "crypto-js";
import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { createContext, useEffect, useState } from "react";
import { StorageDrive } from "@util/types";
import { createClientDrive } from "@util/helpers/storage-drive";

type Props = {
  data: StorageDrive;
  role: Role;
};

export const RoleContext: React.Context<Role> = createContext(Role.VIEWER);

const DrivePage: React.FC<Props> = ({ data, role }) => {
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
        <RoleContext.Provider value={role}>
          {data.type === "firebase" ? (
            <FirebaseProvider data={data} fullPath={decodeURIComponent(folderPath)}>
              <Dashboard />
            </FirebaseProvider>
          ) : data.type === "s3" ||
            data.type === "backblaze" ||
            data.type === "cloudflare" ||
            data.type === "wasabi" ||
            data.type === "digitalocean" ||
            data.type === "scaleway" ? (
            data.permissions === "owned" ? (
              <S3Provider data={data} fullPath={decodeURIComponent(folderPath)}>
                <Dashboard />
              </S3Provider>
            ) : (
              <S3SharedProvider data={data} fullPath={decodeURIComponent(folderPath)}>
                <Dashboard />
              </S3SharedProvider>
            )
          ) : (
            <p>No provider found.</p>
          )}
        </RoleContext.Provider>
      </KeysProvider>
    </>
  );
};

export const getServerSideProps = withIronSessionSsr(async ({ req, res, params }) => {
  try {
    const user = req.session.user;
    const id = params.id as string;
    if (!user?.email) throw new Error("User not logged in");

    const drive = await prisma.drive.findFirst({ where: { id } });
    if (!drive?.keys) throw new Error(`driveId ${id} not found`);

    const bucketOnUser = await prisma.bucketsOnUsers.findFirst({
      where: { userId: user.id, bucketId: drive.id },
    });
    if (!bucketOnUser?.role) throw new Error(`userId ${user.id} cannot access driveId ${drive.id}`);

    const accessDrive =
      drive.type === "firebase"
        ? createClientDrive(drive, Role.CREATOR)
        : createClientDrive(drive, bucketOnUser.role);
    accessDrive.createdAt = accessDrive.createdAt.toString() as any;

    return { props: { data: accessDrive, role: bucketOnUser.role } };
  } catch (err) {
    return { redirect: { permanent: false, destination: "/" }, props: {} };
  }
}, sessionOptions);

export default DrivePage;
