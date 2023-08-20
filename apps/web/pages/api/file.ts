import { Role } from "@prisma/client";
import { createServerDrive } from "@util/helpers/storage-drive";
import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

/**
 * Schema for performing a DELETE operation on a drive for a single object.
 *
 * @param {string} driveId - A required driveId query parameter
 * @param {string} fullPath - A required fullPath query parameter
 */
const deleteSchema = z.object({
  driveId: z.string().nonempty(),
  fullPath: z.string().nonempty(),
});

/**
 * Schema for performing a GET operation on a drive for a single object.
 *
 * @param {string} driveId - A required driveId query parameter
 * @param {string} fullPath - A required fullPath query parameter
 */
const getObjectSchema = z.object({
  driveId: z.string().nonempty(),
  fullPath: z.string().nonempty(),
});

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // authenticate user
    const user = req.session.user;
    if (!user?.email) return res.status(403).json({ error: "You are not logged in." });

    const driveId: string = req.query.driveId || req.body.driveId;
    if (!driveId) return res.status(400).json({ error: `driveId not provided` });

    // fetch the drive for its keys
    const drive = await prisma.drive.findFirst({ where: { id: driveId } });
    if (!drive?.keys) return res.status(400).json({ error: `driveId ${driveId} not found` });

    // validate user has ANY access to this drive
    const { role } = await prisma.bucketsOnUsers.findFirst({
      select: { role: true },
      where: { userId: user.id, bucketId: driveId },
    });
    if (!role)
      return res
        .status(403)
        .json({ error: `userId ${user.id} does not have access to driveId ${drive.id}` });

    const privilegedDrive = createServerDrive(drive, Role.CREATOR);
    if (privilegedDrive.environment !== "server")
      return res.status(500).json({ error: "Server failed to create privilegedDrive" });

    // DELETE
    if (req.method === "DELETE") {
      if (!privilegedDrive.supportsDeletion) {
        return res.status(400).json({ error: `driveId ${drive.id} does not support deletion` });
      }
      if (role === Role.VIEWER)
        return res.status(403).json({
          error: `userId ${user.id} does not have delete permissions in driveId ${drive.id}`,
        });

      const parms = deleteSchema.safeParse(req.query);
      if (!parms.success)
        return res.status(400).json({
          error: "bad delete file parameters",
        });

      const { fullPath } = parms.data;
      const deleteObjectUrl = await privilegedDrive.getDeleteObjectUrl(fullPath);
      return res.status(200).json({ deleteObjectUrl });
    }
    // GET: A single file object
    if (req.method === "GET") {
      if (!privilegedDrive.supportsGetObject) {
        return res.status(400).json({ error: `driveId ${drive.id} does not support deletion` });
      }

      const parms = getObjectSchema.safeParse(req.query);
      if (!parms.success)
        return res.status(400).json({
          error: "bad getObject parameters",
        });

      const { fullPath } = parms.data;
      const getObjectUrl = await privilegedDrive.getObjectUrl(fullPath);
      return res.status(200).json({ getObjectUrl });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
  return res.status(400).json({ error: "invalid method provided" });
}, sessionOptions);
