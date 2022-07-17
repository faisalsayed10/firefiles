import {
	CreateBucketCommand,
	GetBucketCorsCommand,
	PutBucketCorsCommand,
	PutBucketCorsCommandInput,
	PutPublicAccessBlockCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";
import Crypto from "crypto-js";
import MD5 from "js-md5";
import { sha256 as SHA256 } from "js-sha256";

export const createNewBucket = async (
	client: S3Client,
	Bucket: string,
	corsOptions: PutBucketCorsCommandInput
) => {
	await client.send(new CreateBucketCommand({ Bucket, ObjectOwnership: "BucketOwnerEnforced" }));
	await client.send(
		new PutPublicAccessBlockCommand({
			Bucket,
			PublicAccessBlockConfiguration: {
				BlockPublicAcls: true,
				BlockPublicPolicy: true,
				IgnorePublicAcls: true,
				RestrictPublicBuckets: true,
			},
		})
	);
	await client.send(new PutBucketCorsCommand(corsOptions));
};

export const beforeCreatingDoc = async (req: NextApiRequest, res: NextApiResponse, body: any) => {
	const { data, type } = body;

	switch (type) {
		case "firebase":
			return { success: true };
		case "s3":
		case "backblaze":
			const client = new S3Client({
				region: data.region,
				maxAttempts: 1,
				credentials: { accessKeyId: data.accessKey, secretAccessKey: data.secretKey },
				...(data.endpoint ? { endpoint: data.endpoint } : {}),
			});

			const corsOptions = {
				Bucket: data.Bucket,
				CORSConfiguration: {
					CORSRules: [
						{
							AllowedHeaders: ["*"],
							AllowedMethods: ["PUT", "POST", "DELETE", "GET", "HEAD"],
							AllowedOrigins: [process.env.DEPLOY_URL],
							ExposeHeaders: ["ETag"],
						},
					],
				},
			};

			try {
				await client.send(new GetBucketCorsCommand({ Bucket: data.Bucket })); // Get CORS
				await client.send(new PutBucketCorsCommand(corsOptions)); // Update CORS anyway
				return { success: true, error: null };
			} catch (err) {
				if (
					err.name.toLowerCase() === "invalidbucketname" ||
					err.name.toLowerCase() === "nosuchbucket"
				) {
					await createNewBucket(client, data.Bucket, corsOptions); // Bucket doesn't exist, so created a new bucket
					return { success: true, error: null };
				} else if (err.name.toLowerCase() === "nosuchcorsconfiguration") {
					try {
						await client.send(new PutBucketCorsCommand(corsOptions));
						return { success: true, error: null };
					} catch (e) {
						return { success: false, error: e.message };
					}
				}

				console.error(err);
				return { success: false, error: err.message };
			}
		default:
			break;
	}
};

export const signRequest = async (stringToSign: string, secretKey: string) => {
	const stringToSignDecoded = decodeURIComponent(stringToSign);
	const requestScope = stringToSignDecoded.split("\n")[2];
	const [date, region, service, signatureType] = requestScope.split("/");

	const hmacSha256 = (stringToSign, signingKey) => {
		return Crypto.HmacSHA256(signingKey, stringToSign);
	};

	return new Promise<string>(function (resolve, reject) {
		const round1 = hmacSha256(`AWS4${secretKey}`, date);
		const round2 = hmacSha256(round1, region);
		const round3 = hmacSha256(round2, service);
		const round4 = hmacSha256(round3, signatureType);
		const final = hmacSha256(round4, stringToSignDecoded);
		resolve(final.toString(Crypto.enc.Hex));
	});
};

export const cryptoMd5Method = (x) => {
	const o = MD5.create();
	o.update(x);
	return o.base64();
};

export const cryptoHexEncodedHash256 = (x) => {
	const o = SHA256.create();
	o.update(x);
	return o.hex();
};

export const calculateVariablePartSize = (size: number) => {
	const mb = 1024 * 1024;
	const gb = mb * 1024;
	if (size <= 200 * mb) return 5 * mb;
	else if (size <= 5 * gb) return 25 * mb;
	else if (size <= 10 * gb) return 50 * mb;
	else if (size <= 100 * gb) return 100 * mb;
	else return 500 * mb;
};
