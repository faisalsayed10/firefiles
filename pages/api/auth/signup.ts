import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@util/session";
import { NextApiRequest, NextApiResponse } from "next";
import { FirebaseScrypt } from "firebase-scrypt";
import sgMail from "@sendgrid/mail";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";

const scrypt = new FirebaseScrypt({
	memCost: 14,
	rounds: 8,
	saltSeparator: process.env.SALT_SEPARATOR,
	signerKey: process.env.SIGNER_KEY,
});

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const { email, password } = req.body;

		if (!email?.trim() || !password?.trim())
			return res.status(400).json({ error: "Email/Password was not provided." });
		if (!validator.isEmail(email))
			return res.status(400).json({ error: "The email you provided is invalid." });
		if (password.length < 8)
			return res.status(400).json({ error: "Password must be at least 8 characters." });

		const user = await prisma.user.findUnique({ where: { email } });
		if (user) return res.status(400).json({ error: "User already exists." });

		const salt = crypto.randomBytes(8).toString("hex");
		const hashedPassword = await scrypt.hash(password, salt);

		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
		jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" }, (err, token) => {
			const url = `http://localhost:3000/api/auth/verify/${token}`;
			const msg = {
				to: email,
				from: process.env.EMAIL_FROM,
				subject: "Confirm Your Email",
				text: text(url),
			};
			sgMail.send(msg).catch((error) => {
				console.error(error);
				return res.status(500).json({ error: err.message });
			});
		});

		await prisma.user.create({
			data: { email, password: hashedPassword, salt, lastSignedIn: new Date(), verified: false },
		});

		return res.json("Successfully signed up! Please check your inbox to confirm your email.");
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}, sessionOptions);

export const text = (url: string) => `Welcome to Firefiles!

Click on the link below to confirm your email address and complete your sign up.

${url}

Need more help figuring things out? Email us at firefiles@fayd.me or open an issue on our github repo: github.com/faisalsayed10/firefiles`;