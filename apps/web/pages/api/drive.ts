import { Role } from "@prisma/client";
import { beforeCreatingDoc } from "@util/helpers/s3-helpers";
import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { AES } from "crypto-js";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const roleFromString = (value: string): Role => {
  switch (value) {
    case Role.CREATOR:
    case Role.ADMIN:
    case Role.VIEWER:
    case Role.EDITOR:
      return value;
    default:
      throw new Error(`Invalid role: ${value}`);
  }
};

/**
 * Schema for performing a GET operation on Drive records.
 *
 * @param {Role} role - A required Role query parameter
 * @param {boolean} isPending - A required boolean query parameter
 */
const getDriveSchema = z.object({
  role: z.string().nonempty().transform(roleFromString),
  isPending: z
    .string()
    .nonempty()
    .transform((arg) => arg === "true"),
});

/**
 * Schema for performing a POST operation for a Drive record.
 *
 * @param {JSON} data - A required decrypted drive data body parameter
 * @param {string} name - A required drive name body parameter
 * @param {string} type - A required drive type body parameter
 */
const postDriveSchema = z.object({
  data: z.record(z.unknown()), // TODO: Parse func to check for specific drive type properties
  name: z.string().nonempty(),
  type: z.string().nonempty(),
});

/**
 * Schema for performing a DELETE operation on Drive records.
 *
 * @param {string} id - A required drive id query parameter
 */
const deleteDriveSchema = z.object({
  id: z.string().nonempty(),
});

/**
 * Body schema for performing a PUT operation on Firebase Drive records.
 * Required in addition to the putDriveQuerySchema
 * TODO: adjust to allow other drive types/functionality
 *
 * @param {string} data - A required decrypted drive data body parameter
 */
const putDriveBodySchema = z.object({
  data: z.object({
    apiKey: z.string().nonempty(),
    appId: z.string().nonempty(),
    authDomain: z.string().nonempty(),
    password: z.string().optional(),
    projectId: z.string().nonempty(),
    storageBucket: z.string().nonempty(),
  }),
});

/**
 * Query schema for performing a PUT operation on Drive records.
 * Required in addition to the putDriveBodySchema
 *
 * @param {string} id - A required drive id query parameter
 */
const putDriveQuerySchema = z.object({
  id: z.string().nonempty(),
});

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = req.session.user;
    if (!user?.email) return res.status(403).json({ error: "You are not logged in." });

    // READ
    if (req.method === "GET") {
      const parms = getDriveSchema.safeParse(req.query);
      if (!parms.success)
        return res.status(400).json({ error: "Invalid GET drives request params." });
      const { role, isPending } = parms.data;
      const bucketsOnUser = await prisma.bucketsOnUsers.findMany({
        where: {
          userId: user.id,
          role,
          isPending,
        },
      });

      const driveIds = bucketsOnUser.map((bucketOnUser) => bucketOnUser.bucketId);
      const drives = await Promise.all(
        driveIds.map(async (id) => await prisma.drive.findFirst({ where: { id: id } })),
      );
      return res.status(200).json(drives);
      // CREATE
    } else if (req.method === "POST") {
      const parms = postDriveSchema.safeParse(req.body);
      if (!parms.success)
        return res.status(400).json({ error: "Invalid POST drive request params." });
      const { data, name, type } = parms.data;
      const { success, error } = await beforeCreatingDoc(req, res, req.body);

      if (!success) return res.status(400).json({ error });
      const keys = AES.encrypt(JSON.stringify(data), process.env.CIPHER_KEY).toString();
      const drive = await prisma.drive.create({ data: { keys, name, type } });
      await prisma.bucketsOnUsers.create({
        data: { userId: user.id, bucketId: drive.id, isPending: false, role: Role.CREATOR },
      });
      return res.status(200).json({ driveId: drive.id });
      // DELETE
    } else if (req.method === "DELETE") {
      const parms = deleteDriveSchema.safeParse(req.query);
      if (!parms.success)
        return res.status(400).json({ error: "Invalid DELETE drive request params." });
      const { id } = parms.data;

      // Authorize action...
      const { role: requestorRole } = await prisma.bucketsOnUsers.findFirst({
        where: {
          userId: user.id,
          bucketId: id,
        },
      });

      if (!requestorRole)
        return res.status(403).json({
          error: `requesting userId ${user.id} does not have access to bucketId ${id}`,
        });

      if (requestorRole === Role.VIEWER || requestorRole === Role.EDITOR)
        return res.status(403).json({
          error: `cannot revoke access: requesting userId ${user.id} does not have admin access to bucketId ${id}`,
        });

      const { count: bucketsOnUsersCount } = await prisma.bucketsOnUsers.deleteMany({
        where: { bucketId: id },
      });

      const { count: driveCount } = await prisma.drive.deleteMany({
        where: { id: id },
      });

      return res
        .status(200)
        .json(
          `Successfully deleted ${bucketsOnUsersCount} BOU records and ${driveCount} Drive records`,
        );
      // UPDATE
    } else if (req.method === "PUT") {
      const parmsQuery = putDriveQuerySchema.safeParse(req.query);
      if (!parmsQuery.success)
        return res.status(400).json({ error: "Invalid PUT drive request query params." });
      const { id } = parmsQuery.data;

      const parmsBody = putDriveBodySchema.safeParse(req.body);
      if (!parmsBody.success)
        return res.status(400).json({ error: "Invalid PUT drive request body params." });
      const { data } = parmsBody.data;

      const keys = AES.encrypt(JSON.stringify(data), process.env.CIPHER_KEY).toString();
      const { count: putCount } = await prisma.drive.updateMany({ where: { id }, data: { keys } });
      return res.status(200).json(`Successfully updated ${putCount} Drive records`);
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
}, sessionOptions);
