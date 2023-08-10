import prisma from "@util/prisma";
import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { BucketsOnUsers, Role } from "@prisma/client";
import { EmailSender } from "@util/emailSender/emailSender";
import { ResendEmailSender } from "@util/emailSender/resendEmailSender";
import { SendgridEmailSender } from "@util/emailSender/sendgridEmailSender";
import { z } from "zod";
const url = process.env.DEPLOY_URL || process.env.VERCEL_URL;

/**
 * Schema for performing a DELETE operation on a BOU record.
 * Represents either revoking/removing access or detaching from a shared drive
 *
 * @param {string=} inviteeId - An optional userId query parameter
 * @param {string} bucketId - A required bucketId query parameter
 */
const deleteBOUSchema = z.object({
  inviteeId: z.string().optional(),
  bucketId: z.string().nonempty(),
});

/**
 * Schema for performing a PATCH operation on a BOU record.
 * Changes either the role of the user or accepts their invitation to the bucket
 *
 * @param {string} bucketId - A required bucketId body parameter
 * @param {object} inviteeData - An optional object body parameter (must provide inviteeId & role properties)
 */
const patchBOUSchema = z.object({
  bucketId: z.string().nonempty(),
  inviteeData: z
    .object({
      role: z.nativeEnum(Role),
      userId: z.string().nonempty(),
    })
    .optional(),
});

/**
 * Schema for performing a POST operation on a BOU record.
 * Creates a BOU record, optionally a User, and invites this user through email.
 *
 * @param {string} email - A required email address body parameter
 * @param {string} bucketId - A required bucketId body parameter
 * @param {Role} role - A required role body parameter
 */
const postBOUSchema = z.object({
  email: z.string().email().nonempty(),
  bucketId: z.string().nonempty(),
  role: z.nativeEnum(Role),
});

/**
 * Schema for performing a GET operation on a BOU record.
 * Gets all outgoing (provided a bucketId) or incoming access grants
 *
 * @param {string} bucketId - An optional bucketId query parameter
 * @param {boolean} isPending - A required isPending query parameter
 *
 * @returns {BucketsOnUsers[]}
 */
const getBOUSchema = z.object({
  bucketId: z.string().optional(),
  isPending: z.boolean(),
});

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = req.session.user;
    if (!user?.email) return res.status(403).json({ error: "You are not logged in." });

    // GET - READ
    if (req.method === "GET") {
      // Validate params...
      const parms = getBOUSchema.safeParse(req.query);
      if (!parms.success)
        return res.status(400).json({ error: `invalid get BucketsOnUsers parameters` });
      const { bucketId, isPending } = parms.data;

      // Get a user's incoming requests
      if (!bucketId) {
        const bucketsOnUsers = await prisma.bucketsOnUsers.findMany({
          where: { userId: user.id, isPending },
        });

        return res.status(200).json(bucketsOnUsers);
      }
      // Get a bucket's outgoing requests
      // Authorize action...
      const { role: requestorRole } = await prisma.bucketsOnUsers.findFirst({
        select: { role: true },
        where: { userId: user.id, bucketId: bucketId, isPending: false },
      });

      if (!requestorRole)
        return res.status(403).json({
          error: `requesting userId ${user.id} does not have access to bucketId ${bucketId}`,
        });

      if (requestorRole === Role.EDITOR || requestorRole === Role.VIEWER)
        return res.status(403).json({
          error: `cannot read granted access: requesting userId ${user.id} does not have admin access to bucketId ${bucketId}`,
        });

      const bucketsOnUsers = await prisma.bucketsOnUsers.findMany({
        where: { bucketId, isPending },
      });
      return res.status(200).json(bucketsOnUsers);

      // POST - CREATE
    } else if (req.method === "POST") {
      // Validate params...
      const parms = postBOUSchema.safeParse(req.body);
      if (!parms.success)
        return res.status(400).json({ error: `invalid post BucketsOnUsers parameters` });
      const { email, bucketId, role } = parms.data;

      // Authorize action...
      const { role: requestorRole } = await prisma.bucketsOnUsers.findFirst({
        select: { role: true },
        where: { userId: user.id, bucketId: bucketId, isPending: false },
      });

      // Requesting user must have access or invitation to access for this drive
      if (!requestorRole)
        return res.status(403).json({
          error: `requesting userId ${user.id} does not have access to bucketId ${bucketId}`,
        });

      if (requestorRole === Role.EDITOR || requestorRole === Role.VIEWER)
        return res.status(403).json({
          error: `cannot create access invitation: requesting userId ${user.id} does not have admin access to bucketId ${bucketId}`,
        });

      const { id } = await prisma.user.findFirst({ where: { email } });
      // Create Firefiles user if one doesn't yet exist for invitee
      if (!id) {
        const { id: inviteeId } = await prisma.user.create({
          data: { email, verified: false, lastSignedIn: new Date(), createdAt: new Date() },
        });

        await prisma.bucketsOnUsers.create({
          data: { userId: inviteeId, bucketId, isPending: true, role },
        });
        // User should not be permitted multiple bucketsOnUsers records for a single drive
      } else {
        const userBOURecords = await prisma.bucketsOnUsers.findMany({
          where: { userId: id, bucketId },
        });

        if (userBOURecords.length > 0)
          return res.status(403).json({
            error: `cannot create access invitation: userId ${id} already has access to bucketId ${bucketId}`,
          });

        await prisma.bucketsOnUsers.create({
          data: { userId: id, bucketId, isPending: true, role },
        });
      }

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
      // PATCH - UPDATE
    } else if (req.method == "PATCH") {
      // Validate params...
      const parms = patchBOUSchema.safeParse(req.body);
      if (!parms.success)
        return res.status(400).json({ error: `invalid patch BucketsOnUsers parameters` });
      const { bucketId, inviteeData } = parms.data;

      // Authorize action...
      const { role: requestorRole } = await prisma.bucketsOnUsers.findFirst({
        select: { role: true },
        where: { userId: user.id, bucketId: bucketId, isPending: false },
      });

      // Requesting user must have access or invitation to access for this drive
      if (!requestorRole)
        return res.status(403).json({
          error: `requesting userId ${user.id} does not have access to bucketId ${bucketId}`,
        });

      // Patch operation for changing the user's role (requestor == changing user)
      if (inviteeData) {
        if (requestorRole === Role.EDITOR || requestorRole === Role.VIEWER)
          return res.status(403).json({
            error: `cannot change access level: requesting userId ${user.id} does not have admin access to bucketId ${bucketId}`,
          });

        const patchCount = await prisma.bucketsOnUsers.updateMany({
          where: { bucketId, userId: inviteeData.userId },
          data: { role: inviteeData.role },
        });
        return res
          .status(200)
          .json(`successfully patched role of ${patchCount} bucketOnUsers record(s)`);
      }
      // Patch operation for accepting the user's invitation to the drive (requestor == accepting user)
      const patchCount = await prisma.bucketsOnUsers.updateMany({
        where: { bucketId, userId: inviteeData.userId },
        data: { isPending: true },
      });
      return res
        .status(200)
        .json(`successfully patched isPending of ${patchCount} bucketOnUsers record(s)`);
      // DELETE
    } else if (req.method == "DELETE") {
      // Validate params...
      const parms = deleteBOUSchema.safeParse(req.query);
      if (!parms.success)
        return res.status(400).json({ error: `invalid delete BucketsOnUsers parameters` });
      const { inviteeId, bucketId } = parms.data;

      // Authorize action...
      const { role: requestorRole } = await prisma.bucketsOnUsers.findFirst({
        select: { role: true },
        where: { userId: user.id, bucketId: bucketId, isPending: false },
      });

      // Requesting user must have access to the drive
      if (!requestorRole)
        return res.status(403).json({
          error: `requesting userId ${user.id} does not have access to bucketId ${bucketId}`,
        });

      // Delete operation called for revoking or removing access from the invitee
      if (inviteeId) {
        const { role: inviteeRole } = await prisma.bucketsOnUsers.findFirst({
          select: { role: true },
          where: { userId: inviteeId, bucketId: bucketId, isPending: false },
        });

        if (!inviteeRole)
          return res.status(403).json({
            error: `cannot revoke access: invitee userId ${inviteeId} does not have access to remove from bucketId ${bucketId}`,
          });
        if (inviteeRole === Role.CREATOR)
          return res.status(403).json({
            error: `cannot revoke access: invitee userId ${inviteeId} is the creator of bucketId ${bucketId}`,
          });
        if (requestorRole === Role.VIEWER || requestorRole === Role.EDITOR)
          return res.status(403).json({
            error: `cannot revoke access: requesting userId ${user.id} does not have admin access to bucketId ${bucketId}`,
          });
        // Delete operation for detaching the requesting user from the drive
      } else {
        if (requestorRole === Role.CREATOR)
          return res.status(403).json({
            error: `userId ${user.id} cannot detach from bucketId ${bucketId}, user is the bucket creator`,
          });
      }
      // Perform revoke/remove or detach operation
      const deletedBucketsOnUsersCount = await prisma.bucketsOnUsers.deleteMany({
        where: { bucketId: bucketId, userId: inviteeId || user.id },
      });
      return res
        .status(200)
        .json(`successfully removed ${deletedBucketsOnUsersCount} bucketOnUsers record(s)`);
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
}, sessionOptions);
