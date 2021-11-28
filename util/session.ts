import type { IronSessionOptions } from "iron-session";

export const sessionOptions: IronSessionOptions = {
	password: process.env.SECRET_COOKIE_PASSWORD as string,
	cookieName: "sess",
  cookieOptions: {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development"
  }
};

declare module "iron-session" {
	interface IronSessionData {
		user?: { email: string };
	}
}
