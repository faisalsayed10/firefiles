import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { accessKey, secretKey, endpoint, region } = req.body;
  try {
    const client = new S3Client({
      region,
      maxAttempts: 1,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      ...(endpoint ? { endpoint } : {}),
    });

    const response = await client.send(new ListBucketsCommand({}));
    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(err?.$metadata?.httpStatusCode || 400).json({ error: err.message });
  }
};
