import {
	CreateBucketCommand,
	ListBucketsCommand,
	PutBucketCorsCommand,
	PutBucketCorsCommandInput,
	PutPublicAccessBlockCommand,
	S3Client
} from "@aws-sdk/client-s3";
import axios from "axios";
import { deleteApp, getApps } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { BucketType } from "./types";

export const deleteBucket = async (type: BucketType, token: string, id: string) => {
	switch (type) {
		case BucketType.firebase:
			if (window.confirm("Are you sure you want to delete this bucket?")) {
				await axios.delete(`/api/bucket?id=${id}`, {
					headers: { token }
				});

				const has_logged_in =
					window.localStorage.getItem(`has_logged_in_${id}`) === "true" || false;

				const has_initialized = getApps().filter((app) => app.name === id)[0];

				if (has_logged_in && has_initialized) {
					await signOut(getAuth(has_initialized));
					deleteApp(has_initialized);
					window.localStorage.removeItem(`has_logged_in_${id}`);
					window.localStorage.removeItem(`local_folders_${id}`);
				}
			}
			break;
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

export const download = async (name: string, url: string) => {
	try {
		const res = await fetch(url);
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
		a.download = name;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	} catch (err) {
		window.open(url, "_blank");
	}
};

export const validateInput = async (value: any, selectedType: BucketType) => {
	if (selectedType === BucketType.firebase) {
		if (
			!value ||
			!value.apiKey ||
			!value.projectId ||
			!value.appId ||
			!value.authDomain ||
			!value.storageBucket
		)
			throw new Error("One or more fields are missing!");
	} else if (selectedType === BucketType.s3) {
		if (!value || !value.accessKey || !value.secretKey || !value.bucketName || !value.region)
			throw new Error("One or more fields are missing!");
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
				RestrictPublicBuckets: true
			}
		})
	);
	await client.send(new PutBucketCorsCommand(corsOptions));
};
