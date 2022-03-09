import { auth, firestore } from "@util/firebase-admin";
import { AES, enc } from "crypto-js";
import { nanoid } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const token = req.headers.token as string;
		if (!token) return res.status(400).json({ error: "Token not found." });
		const { uid } = await auth.verifyIdToken(token);

		// READ
		if (req.method === "GET") {
			const id = req.query.id as string;
			if (!id) return res.status(400).json({ error: "Bucket ID not found." });

			const snapshot = await firestore.collection("buckets").doc(id).get();
			if (!snapshot.exists || snapshot.data().userId !== uid)
				return res.status(404).json({ error: "Bucket not found." });

			const { keys, name, type, userId } = snapshot.data();
			const decrypted = AES.decrypt(keys, process.env.CIPHER_KEY).toString(enc.Utf8);

			return res
				.status(200)
				.json({ id: snapshot.id, keys: JSON.parse(decrypted), name, type, userId });

			// CREATE
		} else if (req.method === "POST") {
			const { data, name, type } = req.body;
			const keys = AES.encrypt(JSON.stringify(data), process.env.CIPHER_KEY).toString();
			await firestore.collection("buckets").doc(nanoid()).set({ keys, name, type, userId: uid });

			return res.status(200).json("success");

			// DELETE
		} else if (req.method === "DELETE") {
			const id = req.query.id as string;
			if (!id) return res.status(400).json({ error: "Bucket ID not found." });

			const snapshot = await firestore.collection("buckets").doc(id).get();
			if (!snapshot.exists || snapshot.data().userId !== uid)
				return res.status(404).json({ error: "Bucket not found." });

			await firestore.collection("buckets").doc(id).delete();
			return res.status(200).json("success");

			// UPDATE
		} else if (req.method === "PUT") {
			const id = req.query.id as string;
			const data = req.body;

			if (!id) return res.status(400).json({ error: "Token / Bucket ID not found." });

			const snapshot = await firestore.collection("buckets").doc(id).get();
			if (!snapshot.exists || snapshot.data().userId !== uid)
				return res.status(404).json({ error: "Bucket not found." });

			const keys = AES.encrypt(JSON.stringify(data), process.env.CIPHER_KEY).toString();
			await firestore.collection("buckets").doc(id).update({ keys });

			return res.status(200).json("success");
		}
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ error: err.message });
	}
};
