import { GetBucketCorsCommand, PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import { createNewBucket } from "@util/helpers";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { accessKey, secretKey, bucketName: Bucket, region } = req.body;
	const client = new S3Client({
		region,
		maxAttempts: 1,
		credentials: {
			accessKeyId: accessKey,
			secretAccessKey: secretKey
		}
	});

	const corsOptions = {
		Bucket,
		CORSConfiguration: {
			CORSRules: [
				{
					AllowedHeaders: ["*"],
					AllowedMethods: ["PUT", "POST", "DELETE", "GET", "HEAD"],
					AllowedOrigins: [req.headers.host]
				}
			]
		}
	};

	try {
		await client.send(new GetBucketCorsCommand({ Bucket: Bucket })); // Get CORS
		await client.send(new PutBucketCorsCommand(corsOptions)); // Update CORS anyway
		return res.status(200).json("success");
	} catch (err) {
		if (err.name === "InvalidBucketName" || err.name === "NoSuchBucket") {
			await createNewBucket(client, Bucket, corsOptions); // Bucket doesn't exist, so created a new bucket
			return res.status(200).json("success");
		} else if (err.name === "NoSuchCORSConfiguration") {
			await client.send(new PutBucketCorsCommand(corsOptions)); // Create CORS
			return res.status(200).json("success");
		}

		console.error(err);
		return res.status(err.$metadata.httpStatusCode || 400).json({ error: err.message });
	}
};
