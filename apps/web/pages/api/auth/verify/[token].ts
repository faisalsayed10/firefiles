import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
	const token: string = req.query.token as string;
	try {
		const { email } = jwt.verify(token, process.env.JWT_SECRET) as any;
		const user = await prisma.user.upsert({
			where: { email },
			create: { email, verified: true, lastSignedIn: new Date(), createdAt: new Date() },
			update: { verified: true, lastSignedIn: new Date() },
		});

		req.session.user = user;
		await req.session.save();
	} catch (err) {
		console.error(err);
		res.json({ error: err.message });
	} finally {
		res.redirect(process.env.DEPLOY_URL);
	}
}, sessionOptions);
