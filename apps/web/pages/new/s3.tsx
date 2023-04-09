import { Bucket, ListBucketsCommandOutput } from "@aws-sdk/client-s3";
import AWSRegionSelect from "@components/ui/AWSRegionSelect";
import VideoModal from "@components/ui/VideoModal";
import useUser from "@hooks/useUser";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowNarrowLeft } from "tabler-icons-react";
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

			if (selectedBucket === "Not Selected" && !bucketName.trim())
				throw new Error("Select an existing bucket or enter a new bucket name!");

			if (
				(selectedBucket === "Not Selected" && bucketName.trim().length < 3) ||
				bucketName.trim().length > 63
			)
				throw new Error("Bucket name must be between 3 and 63 characters!");

			const Bucket = selectedBucket !== "Not Selected" ? selectedBucket : bucketName.trim();

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
		<>
			<Head>
				<title>AWS S3 | Firefiles</title>
			</Head>
			<div className="px-4 pt-3">
				<button aria-label="back" className="mr-3" onClick={() => router.push("/new")}>
					<ArrowNarrowLeft />
				</button>
				<h3 className="text-lg">Enter your AWS keys</h3>
			</div>
			<div className="flex min-h-screen flex-col items-center justify-center max-w-lg">
				<form className="flex flex-col w-full" onSubmit={listBuckets}>
					<input
						placeholder="Access Key ID"
						type="text"
						value={accessKey}
						onChange={(e) => setAccessKey(e.target.value)}
						required
					/>
					<input
						placeholder="Secret Access Key"
						type="text"
						value={secretKey}
						onChange={(e) => setSecretKey(e.target.value)}
						required
					/>
					<AWSRegionSelect value={region} onChange={setRegion} />
					<VideoModal src="/aws-keys-tutorial.mov" />
					<button type="submit" disabled={loading}>
						{loading ? "Loading" : "Next"}
					</button>
				</form>
				{buckets?.length > 0 ? (
					<>
						<hr className="my-6" />
						<div>
							<h4 className="text-md mb-2">Found {buckets.length} buckets:</h4>
							<p className="text-sm">Choose a bucket:</p>
							{/* <Select value={selectedBucket} onChange={(e) => setSelectedBucket(e.target.value)}>
								<option>Not Selected</option>
								{buckets.map((bucket) => (
									<option key={bucket.CreationDate.toString()} value={bucket.Name}>
										{bucket.Name}
									</option>
								))}
							</Select> */}
							<p className="text-lg align-center my-2">OR</p>
							<p className="text-sm">Create New:</p>
							<input
								placeholder="Bucket Name"
								type="text"
								value={bucketName}
								onChange={(e) => {
									// Bucket name must not contain spaces or uppercase letters
									const text = e.target.value.replace(" ", "").toLowerCase();
									setBucketName(text);
								}}
								required
							/>
							<button className="w-full mt-2" disabled={loading} onClick={createBucket}>
								{loading ? "Loading" : "Create"}
							</button>
						</div>
					</>
				) : null}
			</div>
		</>
	);
};

export default NewS3;
