import {
	CreateBucketCommand,
	GetBucketCorsCommand,
	PutBucketCorsCommand,
	PutBucketCorsCommandInput,
	PutPublicAccessBlockCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import axios from "axios";
import { deleteApp, getApps } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { BucketFile, BucketType } from "./types";

export const deleteBucket = async (type: BucketType, token: string, id: string) => {
	if (window.confirm("Are you sure you want to delete this bucket?")) {
		await axios.delete(`/api/bucket?id=${id}`, {
			headers: { token },
		});

		switch (type) {
			case BucketType.firebase:
				const has_logged_in =
					window.localStorage.getItem(`has_logged_in_${id}`) === "true" || false;

				const has_initialized = getApps().filter((app) => app.name === id)[0];

				if (has_logged_in && has_initialized) {
					await signOut(getAuth(has_initialized));
					deleteApp(has_initialized);
					window.localStorage.removeItem(`has_logged_in_${id}`);
					window.localStorage.removeItem(`local_folders_${id}`);
					break;
				}
			default:
				break;
		}
	}
};

export const onLogout = async () => {
	const apps = getApps().filter((app) => app.name !== "[DEFAULT]");
	apps.forEach(async (app) => {
		await signOut(getAuth(app));
		deleteApp(app);
		window.localStorage.removeItem(`has_logged_in_${app.name}`);
		window.localStorage.removeItem(`local_folders_${app.name}`);
	});
};

export const download = async (file: BucketFile) => {
	try {
		const res = await fetch(file.url);
		const blob = await res.blob();
		const reader = new FileReader();
		await new Promise((resolve, reject) => {
			reader.onload = resolve;
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
		const base64 = (reader.result as string).replace(
			/^data:.+;base64,/,
			"data:application/octet-stream;base64,"
		);

		const a = document.createElement("a");
		a.href = base64;
		a.download = file.name;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	} catch (err) {
		window.open(file.url, "_blank");
	}
};

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
	const { data, name, type } = body;

	switch (type) {
		case "firebase":
			break;
		case "s3":
			const client = new S3Client({
				region: data.region,
				maxAttempts: 1,
				credentials: {
					accessKeyId: data.accessKey,
					secretAccessKey: data.secretKey,
				},
			});

			const corsOptions = {
				Bucket: data.Bucket,
				CORSConfiguration: {
					CORSRules: [
						{
							AllowedHeaders: ["*"],
							AllowedMethods: ["PUT", "POST", "DELETE", "GET", "HEAD"],
							AllowedOrigins: [req.headers.host],
						},
					],
				},
			};

			try {
				await client.send(new GetBucketCorsCommand({ Bucket: data.Bucket })); // Get CORS
				await client.send(new PutBucketCorsCommand(corsOptions)); // Update CORS anyway
				return { success: true, error: null };
			} catch (err) {
				if (err.name === "InvalidBucketName" || err.name === "NoSuchBucket") {
					await createNewBucket(client, data.Bucket, corsOptions); // Bucket doesn't exist, so created a new bucket
					return { success: true, error: null };
				} else if (err.name === "NoSuchCORSConfiguration") {
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
