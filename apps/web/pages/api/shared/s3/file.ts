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
    // authenticate user
    const user = req.session.user;
    if (!user?.email) return res.status(403).json({ error: "You are not logged in." });

    // TODO: Send error if this parameter was not provided in either query or body
    const driveId = req.query.driveId
      ? (req.query.driveId as string)
      : (req.body.driveId as string);

    // validate user has ANY access to this drive
    const { role } = await prisma.bucketsOnUsers.findFirst({
      select: { role: true },
      where: { userId: user.id, bucketId: driveId },
    });
    if (!role) return res.status(403).json({ error: "User does not have access to this drive" });

    // fetch the drive for ALL keys
    const drive = await prisma.drive.findFirst({ where: { id: driveId } });
    if (!drive?.keys) res.status(400).json({ error: "Drive not found" });

    const PrivilegedS3Drive = createStorageDrive(drive, Role.CREATOR);

    const canUseS3 =
      PrivilegedS3Drive.type === "s3" ||
      PrivilegedS3Drive.type === "backblaze" ||
      PrivilegedS3Drive.type === "cloudflare";
    if (!canUseS3 || PrivilegedS3Drive.permissions !== "owned") {
      return res.status(400).json({ error: "Drive type not valid for the S3 provider" });
    }

    const adminClient = new S3Client({
      region: PrivilegedS3Drive.keys.region,
      maxAttempts: 1,
      credentials: {
        accessKeyId: PrivilegedS3Drive.keys.accessKey,
        secretAccessKey: PrivilegedS3Drive.keys.secretKey,
      },
      ...(PrivilegedS3Drive.keys?.endpoint ? { endpoint: PrivilegedS3Drive.keys.endpoint } : {}),
    });
    const signedUrlExpireSeconds = 60;

    // DELETE
    if (req.method === "DELETE") {
      if (role === Role.VIEWER)
        return res.status(403).json({ error: "User does not have delete permissions" });

      const deleteSchema = z.object({
        driveId: z.string().nonempty(),
        fullPath: z.string().nonempty(),
      });
      if (!deleteSchema.parse(req.query)) return;

      const fullFilePath = req.query.fullPath as string;
      const url = await getSignedUrl(
        adminClient,
        new DeleteObjectCommand({
          Bucket: PrivilegedS3Drive.keys.Bucket,
          Key: fullFilePath,
        }),
        {
          expiresIn: signedUrlExpireSeconds,
        },
      );
      return res.status(200).json({ deleteUrl: url });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
}, sessionOptions);
