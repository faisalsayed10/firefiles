import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

const logoutRoute = async (req: NextApiRequest, res: NextApiResponse) => {
	req.session.destroy();
	return res.json({ email: null });
};

export default withIronSessionApiRoute(logoutRoute, sessionOptions);
