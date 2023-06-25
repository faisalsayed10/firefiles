import { Bucket, ListBucketsCommandOutput } from "@aws-sdk/client-s3";
import Layout from "@components/Layout";
import Listbox from "@components/shared/Listbox";
import AWSRegionSelect from "@components/ui/AWSRegionSelect";
import VideoModal from "@components/ui/VideoModal";
import useUser from "@hooks/useUser";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import "video-react/dist/video-react.css";

const NewS3 = () => {
	const { user } = useUser();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [accessKey, setAccessKey] = useState("");
	const [secretKey, setSecretKey] = useState("");
	const [region, setRegion] = useState("");
	const [bucketName, setBucketName] = useState("");
	const [buckets, setBuckets] = useState<Bucket[]>([]);
	const [selectedBucket, setSelectedBucket] = useState("Not Selected");

	const listBuckets = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!user?.email) throw new Error("You need to login to perform this action!");

			if (!accessKey.trim() || !secretKey.trim() || !region.trim())
				throw new Error("One or more fields are missing!");

			const { data } = await axios.post<ListBucketsCommandOutput>("/api/s3/list-buckets", {
				accessKey,
				secretKey,
				region,
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

			if (!accessKey.trim() || !secretKey.trim() || !region.trim())
				throw new Error("One or more fields are missing!");

			if (selectedBucket === "" && !bucketName.trim())
				throw new Error("Select an existing bucket or enter a new bucket name!");

			if ((selectedBucket === "" && bucketName.trim().length < 3) || bucketName.trim().length > 63)
				throw new Error("Bucket name must be between 3 and 63 characters!");

			const Bucket = selectedBucket !== "" ? selectedBucket : bucketName.trim();

			await axios.post("/api/drive", {
				data: {
					accessKey,
					secretKey,
					Bucket,
					bucketUrl: `https://${Bucket}.s3.${region}.amazonaws.com`,
					region,
				},
				name: Bucket,
				type: "s3",
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
				<title>AWS S3 | Firefiles</title>
			</Head>
			<div className="flex items-center justify-center flex-1">
				<form className="border shadow p-4 rounded-lg max-w-sm w-full" onSubmit={listBuckets}>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Enter your AWS credentials
					</label>
					<input
						required
						placeholder="Access Key ID"
						type="text"
						value={accessKey}
						className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 mb-2"
						onChange={(e) => setAccessKey(e.target.value)}
					/>
					<input
						required
						placeholder="Secret Access Key"
						type="text"
						value={secretKey}
						className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
						onChange={(e) => setSecretKey(e.target.value)}
					/>
					<AWSRegionSelect value={region} onChange={setRegion} />
					<div className="flex items-center justify-between mt-4">
						<VideoModal src="/aws-keys-tutorial.mov" />
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
