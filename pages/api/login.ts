import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import argon2 from "argon2";
export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
	const { email, password } = await req.body;

	try {
		if (email === process.env.LOGIN_EMAIL && argon2.verify(process.env.LOGIN_PASSWORD, password)) {
			req.session.user = { email };
			await req.session.save();
			return res.status(200).json({ ...req.session.user });
		} else {
			throw new Error("Invalid email or password.");
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: (err as Error).message });
	}
}
