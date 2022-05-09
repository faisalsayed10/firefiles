export default () => {};

// import sgMail from "@sendgrid/mail";
// import { sessionOptions } from "@util/session";
// import crypto from "crypto";
// import { FirebaseScrypt } from "firebase-scrypt";
// import { withIronSessionApiRoute } from "iron-session/next";
// import jwt from "jsonwebtoken";
// import { NextApiRequest, NextApiResponse } from "next";

// const scrypt = new FirebaseScrypt({
// 	memCost: 14,
// 	rounds: 8,
// 	saltSeparator: process.env.SALT_SEPARATOR,
// 	signerKey: process.env.SIGNER_KEY,
// });

// export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
// 	try {
// 		const { password } = req.body;

// 		if (!password?.trim()) return res.status(400).json({ error: "Password was not provided." });
// 		if (password.length < 8)
// 			return res.status(400).json({ error: "Password must be at least 8 characters." });

// 		const salt = crypto.randomBytes(8).toString("hex");
// 		const hashedPassword = await scrypt.hash(password, salt);

// 		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// 		jwt.sign({ password }, process.env.JWT_SECRET, { expiresIn: "1d" }, (err, token) => {
// 			const url = `http://localhost:3000/api/auth/verify/${token}`;
// 			const msg = {
// 				to: email,
// 				from: process.env.EMAIL_FROM,
// 				subject: "Confim Your Email",
// 				text: text(url),
// 				html: html(url),
// 			};
// 			sgMail.send(msg).catch((error) => {
// 				console.error(error);
// 				return res.status(500).json({ error: err.message });
// 			});
// 		});

// 		await prisma.user.create({
// 			data: { email, password: hashedPassword, salt, lastSignedIn: new Date(), verified: false },
// 		});

// 		return res.json("Successfully signed up! Please check your inbox to confirm your email.");
// 	} catch (err) {
// 		res.status(500).json({ error: err.message });
// 	}
// }, sessionOptions);
