import { Role } from "@prisma/client";
import { createServerDrive } from "@util/helpers/storage-drive";
import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

/**
 * Schema for performing a GET operation on a drive to fetch a list of objects.
 *
 * @param {string} fullPath - An optional fullPath query parameter
 * @param {string=} continuationToken - An optional continuation query parameter
 * @param {string=} delimiter - An optional delimiter query parameter
 */
const getObjectsListSchema = z.object({
  fullPath: z.string(),
  continuationToken: z.string().optional(),
  delimiter: z.string().optional(),
});

/**
 * Schema for performing a DELETE operation on a drive remove a list of objects.
 *
 * @param {string} deleteParams - A required deleteParams query parameter
 */
const deleteObjectsSchema = z.object({
  deleteParams: z.string().nonempty(),
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
      where: { userId: user.id, bucketId: driveId, isPending: false },
    });
    if (!role)
      return res
        .status(403)
        .json({ error: `userId ${user.id} does not have access to driveId ${drive.id}` });

    const privilegedDrive = createServerDrive(drive, Role.CREATOR);
    if (privilegedDrive.environment !== "server")
      return res.status(500).json({ error: "Server failed to create privilegedDrive" });

    // GET: A list of objects
    if (req.method === "GET") {
      if (!privilegedDrive.supportsListObjects)
        return res
          .status(400)
          .json({ error: `driveId ${drive.id} does not support getObjectsList` });

      const parms = getObjectsListSchema.safeParse(req.query);
      if (!parms.success) return res.status(400).json({ error: `bad getObjectsList parameters` });

      const { fullPath, continuationToken, delimiter } = parms.data;

      const getObjectsListUrl = await privilegedDrive.getListObjectsUrl(
        fullPath,
        delimiter,
        continuationToken,
      );

      return res.status(200).json({ getObjectsListUrl });
    }

    if (req.method === "DELETE") {
      if (!privilegedDrive.supportsDeletion) {
        return res.status(400).json({ error: `driveId ${drive.id} does not support deletion` });
      }
      if (role === Role.VIEWER)
        return res.status(403).json({
          error: `userId ${user.id} does not have delete permissions in driveId ${drive.id}`,
        });

      const parms = deleteObjectsSchema.safeParse(req.query);
      if (!parms.success)
        return res.status(400).json({ error: `invalid deleteObjects parameters` });

      const { deleteParams } = parms.data;
      privilegedDrive.performDeleteObjects(deleteParams);

      return res.status(200).json({ message: `objects ${deleteParams} successfully deleted` });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
  return res.status(400).json({ error: "invalid method provided" });
}, sessionOptions);
