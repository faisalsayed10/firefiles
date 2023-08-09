import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@prisma/client";
import { EmailSender } from "@util/emailSender/emailSender";
import { ResendEmailSender } from "@util/emailSender/resendEmailSender";
import { SendgridEmailSender } from "@util/emailSender/sendgridEmailSender";
const url = process.env.DEPLOY_URL || process.env.VERCEL_URL;

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = req.session.user;
    if (!user?.email) return res.status(403).json({ error: "You are not logged in." });

    // READ
    if (req.method === "GET") {
      const { role, isPending } = req.query;
      const bucketsOnUser = await prisma.bucketsOnUsers.findMany({
        where: {
          userId: user.id,
          role: role as Role,
          isPending: isPending === "true",
        },
      });
      return res.status(200).json(bucketsOnUser);
      // CREATE
    } else if (req.method === "POST") {
      const { email, bucketId, role } = req.body;
      let receiver = await prisma.user.findFirst({ where: { email } });
      if (!receiver) {
        receiver = await prisma.user.create({
          data: { email, verified: false, lastSignedIn: new Date(), createdAt: new Date() },
        });
      }
      await prisma.bucketsOnUsers.create({
        data: { userId: receiver.id, bucketId: bucketId, isPending: true, role: role as Role },
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
      // UPDATE
    } else if (req.method == "PATCH") {
      const data = req.body;
      if (!data.bucketId) return res.status(400).json({ error: "Bucket ID not found." });
      await prisma.bucketsOnUsers.updateMany({
        where: { bucketId: data.bucketId, userId: user.id },
        data: data,
      });
      return res.status(200).json("ok");
      // DELETE
    } else if (req.method == "DELETE") {
      const { inviteeId, bucketId } = req.body;
      if (!bucketId) return res.status(400).json({ error: "Bucket ID not found." });
      await prisma.bucketsOnUsers.deleteMany({
        where: { bucketId: bucketId, userId: inviteeId || user.id },
      });
      return res.status(200).json("ok");
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
}, sessionOptions);
