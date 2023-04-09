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
		<>
			<Head>
				<title>Firebase | Firefiles</title>
			</Head>
			<div className="px-4 pt-3">
				<button aria-label="back" className="mr-3" onClick={() => router.push("/new")}>
					<ArrowNarrowLeft />
				</button>
				<h3 className="text-lg">Paste your Firebase config</h3>
			</div>
			<div className="flex min-h-screen flex-col items-center justify-center max-w-lg">
				<form className="flex flex-col w-full" onSubmit={createBucket}>
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
								href="https://firefiles.app/docs/firebase/01-setup"
								target="_blank"
								style={{ textDecoration: "underline" }}
							>
								steps!
							</a>
						</span>
					</Alert> */}
					<VideoModal src="/firebase-config-tutorial.mov" />
					<button type="submit" disabled={loading}>
						{loading ? "Loading" : "Create"}
					</button>
				</form>
			</div>
		</>
	);
};

export default NewFirebase;
