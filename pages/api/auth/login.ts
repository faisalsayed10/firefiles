import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@util/session";
import { NextApiRequest, NextApiResponse } from "next";
import { FirebaseScrypt } from "firebase-scrypt";
import { omit } from "underscore";

const scrypt = new FirebaseScrypt({
	memCost: 14,
	rounds: 8,
	saltSeparator: process.env.SALT_SEPARATOR,
	signerKey: process.env.SIGNER_KEY,
});

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
	const { email, password } = req.body;

	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user?.email) return res.status(404).json({ error: "User not found!" });
		if (!user.verified) return res.status(403).json({ error: "User not verified!" });

		const valid = await scrypt.verify(password, user.salt, user.password);
		if (!valid) return res.status(403).json({ error: "Password is incorrect!" });

		req.session.user = omit(user, ["password", "salt"]);
		await req.session.save();
		res.json(user);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}, sessionOptions);
