import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { ErrorIcon } from "react-hot-toast";
import { AlertCircle } from "tabler-icons-react";

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
					<p className="bg-red-100 p-4 rounded-md flex items-start justify-center gap-2 mb-2">
						<div>
							<AlertCircle width={26} height={26} className="text-red-600" />
						</div>
						<span>{router.query.message}</span>
					</p>
					<p className="text-center mb-1">
						<Link
							href="https://firefiles.app/docs"
							target="_blank"
							className="underline text-indigo-600 text-sm"
						>
							Read the docs
						</Link>
					</p>
					<button
						className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={() => router.push("/")}
					>
						Back to Home
					</button>
				</div>
			</div>
		</>
	);
};

export default Error;
