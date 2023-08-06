import { EmailSender, LoginEmailOptions } from "./emailSender";
import { Resend } from "resend";
import { loginHtml, loginText } from "./format";

export class ResendEmailSender implements EmailSender {
  async sendLoginEmail(options: LoginEmailOptions): Promise<void> {
    const { email, url, token } = options;
    const resend = new Resend(process.env.RESEND_API_KEY || "re_123");
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      html: loginHtml(`${url}/api/auth/verify/${token}`, email),
      text: loginText(`${url}/api/auth/verify/${token}`, email),
      subject: "Log in to Firefiles",
      tags: [{ name: "firefiles", value: "login_link" }],
    });
  }
}
