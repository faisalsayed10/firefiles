import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@util/session";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req: NextApiRequest, res: NextApiResponse) {
	if (req.session.user) {
		return res.json({ email: req.session.user.email });
	} else {
		return res.json({ email: null });
	}
}
