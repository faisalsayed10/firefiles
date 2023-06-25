import Layout from "@components/Layout";
import VideoModal from "@components/ui/VideoModal";
import useUser from "@hooks/useUser";
import axios from "axios";
import toObject from "convert-to-object";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowNarrowLeft } from "tabler-icons-react";
import "video-react/dist/video-react.css";

const jsonPlaceholder = `{
  apiKey: "AIzafeaubu13ub13j",
  authDomain: "myapp-f3190.firebaseapp.com",
  projectId: "myapp-f3190",
  storageBucket: "myapp-f3190.appspot.com",
  appId: "1:8931361818:web:132af17fejaj3695cf"
}`;

const NewFirebase = () => {
	const [raw, setRaw] = useState("");
	const { user } = useUser();
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const createBucket = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!user?.email) throw new Error("You need to login to perform this action!");

			const data = toObject(raw);
			if (
				!data ||
				!data.apiKey ||
				!data.projectId ||
				!data.appId ||
				!data.authDomain ||
				!data.storageBucket
			)
				throw new Error("One or more fields are missing!");

			const promise = axios.post("/api/drive", { data, name: data.projectId, type: "firebase" });

			toast.promise(promise, {
				loading: "Creating drive...",
				success: "Drive created successfully.",
				error: "An error occurred while creating the drive.",
			});

			promise.then(() => router.push("/"));
		} catch (err) {
			console.error(err);
			toast.error(err.message);
		}

		setLoading(false);
	};

	return (
		<Layout>
			<Head>
				<title>Firebase | Firefiles</title>
			</Head>
			<div className="flex-1 flex items-center justify-center">
				<form className="border shadow p-4 rounded-lg max-w-sm w-full" onSubmit={createBucket}>
					<label htmlFor="credentials" className="block text-sm font-medium text-gray-700 mb-2">
						Paste your credentials
					</label>
					<textarea
						rows={10}
						value={raw}
						name="credentials"
						onChange={(e) => setRaw(e.target.value)}
						className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 ring-1 ring-inset ring-gray-100 focus:ring-indigo-600"
						placeholder={jsonPlaceholder}
						required
					/>
					<div className="flex items-center justify-between mt-4">
						<VideoModal src="/firebase-config-tutorial.mov" />
						<button
							type="submit"
							disabled={loading}
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
						>
							{loading ? "Loading" : "Create"}
						</button>
					</div>
				</form>
			</div>
		</Layout>
	);
};

{
	/* <form className="flex flex-col max-w-4xl" onSubmit={createBucket}>
	<textarea
		value={raw}
		onChange={(e) => setRaw(e.target.value)}
		className="w-full p-2 border border-gray-300 rounded-md"
		placeholder={jsonPlaceholder}
		required
	/>
	{/* <Alert status="info" mt="2">
						<AlertIcon />
						<span>
							Make sure you've followed all the{" "}
							<a
								href=""
								target="_blank"
								style={{ textDecoration: "underline" }}
							>
								steps!
							</a>
						</span>
					</Alert> */
}
// 	<VideoModal src="/firebase-config-tutorial.mov" />
// 	<button type="submit" disabled={loading}>
// 		{loading ? "Loading" : "Create"}
// 	</button>
// </form>; */}

export default NewFirebase;
