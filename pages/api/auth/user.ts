import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
	return res.json(req.session.user || {});
}, sessionOptions);
