import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { omit } from "underscore";

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
	const token: string = req.query.token as string;
	try {
		const { email } = jwt.verify(token, process.env.JWT_SECRET);
		const user = await prisma.user.update({ where: { email }, data: { verified: true } });

		req.session.user = omit(user, ["password", "salt"]);
		await req.session.save();
	} catch (err) {
		console.error(err);
		res.json({ error: err.message });
	} finally {
		res.redirect("http://localhost:3000");
	}
}, sessionOptions);
