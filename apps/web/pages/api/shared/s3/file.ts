import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Role } from "@prisma/client";
import { createStorageDrive } from "@util/helpers/storage-drive";
import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // no "shared"/
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

    const privilegedDrive = createStorageDrive(drive, Role.CREATOR);

    // DELETE
    if (req.method === "DELETE") {
      if (!privilegedDrive.supportsDeletion || role === Role.VIEWER)
        return res
          .status(403)
          .json({
            error: `userId ${user.id} does not have delete permissions in driveId ${drive.id}`,
          });

      // TODO: move this out
      const deleteSchema = z.object({
        driveId: z.string().nonempty(),
        fullPath: z.string().nonempty(),
      });
      if (!deleteSchema.parse(req.query)) return;

      const fullFilePath = req.query.fullPath as string;
      const url = await privilegedDrive.performDelete(privilegedDrive, fullFilePath);
      return res.status(200).json({ deleteUrl: url });
    }
    // handle corner case
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
}, sessionOptions);
