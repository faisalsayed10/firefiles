import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@prisma/client";

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = req.session.user || JSON.parse(req.query.user as string);
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
      const { id, userId, isPending, role } = req.body;
      if (!id || !userId || isPending === null || role === null)
        return res.status(400).json({ error: "Invalid request." });
      await prisma.bucketsOnUsers.create({
        data: { userId: userId, bucketId: id, isPending, role },
      });
      return res.status(200).json("ok");
      // DELETE
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
}, sessionOptions);
