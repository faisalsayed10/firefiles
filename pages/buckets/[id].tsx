import Dashboard from "@components/Dashboard";
import { FirebaseProvider } from "@hooks/useFirebase";
import useUser from "@hooks/useUser";
import { Bucket } from "@util/types";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import nookies from "nookies";
import React, { useEffect, useState } from "react";

type Props = {
	data: Bucket;
};

const BucketPage: React.FC<Props> = ({ data }) => {
	const router = useRouter();
	const [folderPath, setFolderPath] = useState("");
	const { currentUser, loading } = useUser();

	useEffect(() => {
		const pathArray = router.asPath.split("/buckets/")[1].split("/");
		setFolderPath(pathArray.slice(1).join("/"));
	}, [router.asPath]);

	useEffect(() => {
		if (loading) return;
		if (!currentUser) {
			router.push("/login");
		}
	}, [currentUser, loading]);

	return (
		<>
			<Head>
				<title>Firefiles - Your Files</title>
				<meta charSet="utf-8" />
			</Head>
			<FirebaseProvider data={data} fullPath={decodeURIComponent(folderPath)}>
				<Dashboard />
			</FirebaseProvider>
		</>
	);
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
	try {
		const url =
			process.env.NODE_ENV !== "production"
				? "http://localhost:3000"
				: "https://usefirefiles.vercel.app";

		const cookies = nookies.get(ctx);
		const id = ctx.params.id;
		const { data } = await axios.get(`${url}/api/bucket?id=${id}`, {
			headers: { token: cookies.token },
		});

		return { props: { data } };
	} catch (err) {
		return {
			redirect: {
				permanent: false,
				destination: "/",
			},
			props: {} as never,
		};
	}
};

export default BucketPage;
