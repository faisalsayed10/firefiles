import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = req.session.user;
    if (!user?.email) return res.status(403).json({ error: "You are not logged in." });

    // Create
    if (req.method === "POST") {
      const { bucketId, inviteeId } = req.body;
      const bucketOnUsers = await prisma.bucketsOnUsers.deleteMany({
        where: { bucketId: bucketId, userId: inviteeId, isPending: true },
      });

      if (!bucketOnUsers[0]) {
        return res.status(400).json({ error: "Invalid Request" });
      }

      await prisma.invitation.deleteMany({
        where: { invitationId: bucketOnUsers[0].id },
      });
      return res.status(200).json({
        message: `You have revoked the invitation to this bucket.`,
      });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
}, sessionOptions);
