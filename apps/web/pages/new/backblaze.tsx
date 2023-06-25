import { Bucket, ListBucketsCommandOutput } from "@aws-sdk/client-s3";
import VideoModal from "@components/ui/VideoModal";
import useUser from "@hooks/useUser";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowNarrowLeft } from "tabler-icons-react";
import "video-react/dist/video-react.css";
import validator from "validator";
import Layout from "@components/Layout";
import Listbox from "@components/shared/Listbox";

const NewS3 = () => {
	const { user } = useUser();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [keyId, setKeyId] = useState("");
	const [applicationKey, setApplicationKey] = useState("");
	const [endpoint, setEndpoint] = useState("");
	const [bucketName, setBucketName] = useState("");
	const [buckets, setBuckets] = useState<Bucket[]>([]);
	const [selectedBucket, setSelectedBucket] = useState("Not Selected");

	const listBuckets = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!user?.email) throw new Error("You need to login to perform this action!");

			if (!keyId.trim() || !applicationKey.trim() || !endpoint.trim())
				throw new Error("One or more fields are missing!");

			if (
				!validator.isURL(endpoint, { require_protocol: true, protocols: ["https"] }) ||
				!/^(https:\/\/s3\.).+(\.backblazeb2.com)$/g.test(endpoint)
			)
				throw new Error("Endpoint URL does not match the required format!");

			const { data } = await axios.post<ListBucketsCommandOutput>("/api/s3/list-buckets", {
				accessKey: keyId,
				secretKey: applicationKey,
				endpoint,
				region: endpoint.split(".")[1],
			});

			setBuckets(data.Buckets);
		} catch (err) {
			console.error(err);
			toast.error(err?.response?.data?.error || err.message);
		}

		setLoading(false);
	};

	const createBucket = async () => {
		setLoading(true);

		try {
			if (!user?.email) throw new Error("You need to login to perform this action!");

			if (!keyId.trim() || !applicationKey.trim())
				throw new Error("One or more fields are missing!");

			if (
				!validator.isURL(endpoint, { require_protocol: true, protocols: ["https"] }) ||
				!/^(https:\/\/s3\.).+(\.backblazeb2.com)$/g.test(endpoint)
			)
				throw new Error("Endpoint URL does not match the required format!");

			if ((selectedBucket === "" && !bucketName.trim()) || !endpoint.trim())
				throw new Error("Select an existing bucket or enter a new bucket name!");

			if ((selectedBucket === "" && bucketName.trim().length < 3) || bucketName.trim().length > 63)
				throw new Error("Bucket name must be between 3 and 63 characters!");

			const Bucket = selectedBucket !== "" ? selectedBucket : bucketName.trim();

			await axios.post("/api/drive", {
				data: {
					accessKey: keyId,
					secretKey: applicationKey,
					Bucket,
					bucketUrl: `https://${Bucket}.s3.${endpoint.split(".")[1]}.backblazeb2.com`,
					endpoint,
					region: endpoint.split(".")[1],
				},
				name: Bucket,
				type: "backblaze",
			});

			toast.success("Drive created successfully!");
			router.push("/");
		} catch (err) {
			console.error(err);
			toast.error(err?.response?.data?.error || err.message);
		}

		setLoading(false);
	};

	return (
		<Layout>
			<Head>
				<title>Backblaze | Firefiles</title>
			</Head>

			<div className="flex items-center justify-center flex-1">
				<form className="border shadow p-4 rounded-lg max-w-sm w-full" onSubmit={listBuckets}>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Enter your Backblaze credentials
					</label>
					<input
						required
						placeholder="Key ID"
						type="text"
						value={keyId}
						className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 mb-2"
						onChange={(e) => setKeyId(e.target.value)}
					/>
					<input
						required
						placeholder="Application Key"
						type="text"
						value={applicationKey}
						className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 mb-2"
						onChange={(e) => setApplicationKey(e.target.value)}
					/>
					<input
						required
						placeholder="Endpoint - https://s3.<your-region>.backblazeb2.com"
						type="text"
						value={endpoint}
						className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
						onChange={(e) => setEndpoint(e.target.value)}
					/>

					<div className="flex items-center justify-between mt-4">
						<VideoModal src="" />
						<button
							type="submit"
							disabled={loading}
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
						>
							{loading ? "Loading" : "Next"}
						</button>
					</div>

					{buckets?.length > 0 ? (
						<>
							<hr className="my-3" />
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Found {buckets.length} buckets
								</label>
								<Listbox
									value={selectedBucket}
									onChange={setSelectedBucket}
									label={selectedBucket || "Choose a bucket"}
									options={buckets.map((bucket) => ({ label: bucket.Name, value: bucket.Name }))}
								/>
								<label className="block text-sm font-medium text-gray-700 my-2">
									Or create a new bucket:
								</label>
								<input
									required
									type="text"
									value={bucketName}
									placeholder="Bucket Name"
									className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
									onChange={(e) => {
										// Bucket name must not contain spaces or uppercase letters
										const text = e.target.value.replace(" ", "").toLowerCase();
										setBucketName(text);
									}}
								/>
								<div className="flex items-center justify-between mt-4">
									<div />
									<button
										disabled={loading}
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
										onClick={createBucket}
									>
										{loading ? "Loading" : "Create"}
									</button>
								</div>
							</div>
						</>
					) : null}
				</form>
			</div>
		</Layout>
	);
};

export default NewS3;
