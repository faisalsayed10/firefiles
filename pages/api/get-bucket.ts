import { auth, firestore } from "@util/firebase-admin";
import { AES, enc } from "crypto-js";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const token = req.headers.token as string;
		const id = req.query.id as string;
		if (!token || !id) return res.status(401).json({ error: "Token / Bucket ID not found." });
		const { uid } = await auth.verifyIdToken(token);

		const snapshot = await firestore.collection("buckets").doc(id).get();
		if (!snapshot.exists || snapshot.data().userId !== uid)
			return res.status(404).json({ error: "Bucket not found." });

		const { keys, name, type, userId } = snapshot.data();
		const decrypted = AES.decrypt(keys, process.env.CIPHER_KEY).toString(enc.Utf8);

		return res
			.status(200)
			.json({ id: snapshot.id, keys: JSON.parse(decrypted), name, type, userId });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
};
