import { auth, firestore } from "@util/firebase-admin";
import { AES } from "crypto-js";
import { nanoid } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const token = req.headers.token as string;
		if (!token) return res.status(401).json({ error: "No token found" });
		const { uid } = await auth.verifyIdToken(token);

		const { data, name, type } = req.body;
		const keys = AES.encrypt(JSON.stringify(data), process.env.CIPHER_KEY).toString();
		await firestore.collection("buckets").doc(nanoid()).set({ keys, name, type, userId: uid });

		return res.status(200).json("success");
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ error: err.message });
	}
};
