import mime from "mime-types";
import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import stream from "stream";
import { promisify } from "util";

const pipeline = promisify(stream.pipeline);

export default async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const { url, download, filename } = req.query;

		const contentType = mime.lookup(filename as string);

		const response = await fetch(url as string);
		if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);

		contentType && res.setHeader("Content-Type", contentType);
		res.setHeader(
			"Content-Disposition",
			`${download ? "attachment" : "inline"}; filename="${filename || "file"}"`
		);

		await pipeline(response.body, res);
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ error: err.message });
	}
};
