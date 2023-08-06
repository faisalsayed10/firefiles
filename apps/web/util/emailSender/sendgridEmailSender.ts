import { EmailSender, LoginEmailOptions } from "./emailSender";
import sendgrid from "@sendgrid/mail";
import { loginHtml, loginText } from "./format";

export class SendgridEmailSender implements EmailSender {
  async sendLoginEmail(options: LoginEmailOptions): Promise<void> {
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY || "SG.empty");
    const { email, url, token } = options;
    await sendgrid.send({
      from: process.env.EMAIL_FROM,
      to: email,
      html: loginHtml(`${url}/api/auth/verify/${token}`, email),
      text: loginText(`${url}/api/auth/verify/${token}`, email),
      subject: "Log in to Firefiles",
      categories: ["firefiles", "login_link"],
    });
  }
}
