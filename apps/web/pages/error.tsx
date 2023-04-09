import Link from "next/link";
import CenterContainer from "@components/ui/CenterContainer";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

const Error = () => {
	const router = useRouter();
	return (
		<>
			<Head>
				<title>Something Went Wrong | Firefiles</title>
			</Head>
			<div className="flex items-center justify-center min-h-screen">
				<div className="w-full max-w-md p-4">
					<h2 className="text-2xl font-semibold text-center mb-4">An Unexpected Error Occurred</h2>
					{/* <Alert status="error" fontSize="md" mb="6">
						<AlertIcon /> */}
					{router.query.message}
					{/* </Alert> */}
					<p className="text-center mb-4">
						<Link href="https://firefiles.app/docs" target="_blank">
							Make sure you're not missing anything
						</Link>
					</p>
					<button className="w-full" onClick={() => router.push("/")}>
						Back to Home
					</button>
				</div>
			</div>
		</>
	);
};

export default Error;
