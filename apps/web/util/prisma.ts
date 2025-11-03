import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const prisma = global.prisma || new PrismaClient({ adapter, log: ["info"] });
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
