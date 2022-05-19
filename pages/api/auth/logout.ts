import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
	req.session.destroy();
	return res.json("ok");
}, sessionOptions);
