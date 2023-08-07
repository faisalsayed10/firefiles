import { Role } from "@prisma/client";
import { EmailSender } from "@util/emailSender/emailSender";
import { ResendEmailSender } from "@util/emailSender/resendEmailSender";
import { SendgridEmailSender } from "@util/emailSender/sendgridEmailSender";
import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

const url = process.env.DEPLOY_URL || process.env.VERCEL_URL;
export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sender = req.session.user;
    if (!sender?.email) return res.status(403).json({ error: "You are not logged in." });

    // Create
    if (req.method === "POST") {
      const { email, bucketId } = req.body;
      let user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: { email, verified: false, lastSignedIn: new Date(), createdAt: new Date() },
        });
      }
      await prisma.bucketsOnUsers.create({
        data: { userId: user.id, bucketId: bucketId, isPending: true, role: Role.VIEWER },
      });

      const emailSender: EmailSender = process.env.RESEND_API_KEY
        ? new ResendEmailSender()
        : new SendgridEmailSender();

      await emailSender.sendInvitationEmail({
        email: email,
        url: `${url}/login`,
      });
      return res.status(200).json({
        message: `An invitation has been sent to ${email}.`,
      });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
}, sessionOptions);
