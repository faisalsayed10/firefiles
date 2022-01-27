import axios, { AxiosResponse } from "axios";
import { AES, enc } from "crypto-js";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { uid, token } = req.headers;
	const url = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`;
	let response: AxiosResponse;
	if (!uid || !token) return res.status(400).json({ error: "Missing headers" });
	try {
		switch (req.method) {
			case "GET":
				response = await axios.get(url, { headers: { Authorization: `Firebase ${token}` } });
				const encrypted = response.data.fields.config.stringValue;
				const bytes = AES.decrypt(encrypted, process.env.CIPHER_KEY).toString(enc.Utf8);

				res.setHeader("Cache-Control", "s-maxage=300");
				return res.status(200).json(JSON.parse(bytes));
			case "POST":
				const data = req.body;
				const ciphertext = AES.encrypt(JSON.stringify(data), process.env.CIPHER_KEY).toString();

				response = await axios.patch(
					url,
					{ fields: { config: { stringValue: ciphertext } } },
					{ headers: { Authorization: `Firebase ${token}` } }
				);

				return res.status(200).json("success");
			default:
				res.status(405).json({ message: "Method not allowed" });
		}
	} catch (err) {
		console.error(err.message);
		return res.status(200).json(undefined);
	}
};
