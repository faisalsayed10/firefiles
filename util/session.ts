import { User } from "@prisma/client";
import type { IronSessionOptions } from "iron-session";

export const sessionOptions: IronSessionOptions = {
	password: process.env.COOKIE_PASSWORD as string,
	cookieName: "auth-session",
	cookieOptions: {
		secure: process.env.NODE_ENV === "production",
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
	},
};

declare module "iron-session" {
	interface IronSessionData {
		user?: Omit<User, "password" | "salt">;
	}
}
