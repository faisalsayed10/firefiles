import sgMail from "@sendgrid/mail";
import rateLimit from "@util/rate-limit";
import { sessionOptions } from "@util/session";
import { withIronSessionApiRoute } from "iron-session/next";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import validator from "validator";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const limiter = rateLimit({
	interval: 5 * 60 * 1000, // 5 minutes
	uniqueTokenPerInterval: 500, // Max 500 users per second
});

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		await limiter.check(res, 5, "CACHE_TOKEN"); // 5 requests per 5 minutes
	} catch (error) {
		return res.status(429).json({ error: "Too many requests. Please try again after 5 minutes." });
	}

	const { email } = req.body;
	if (!validator.isEmail(email))
		return res.status(400).json({ error: "The email you provided is invalid." });

	try {
		const token = await jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

		const response = await sgMail.send({
			to: email,
			from: process.env.EMAIL_FROM,
			subject: "Log in to Firefiles",
			text: text(`${process.env.DEPLOY_URL}/api/auth/verify/${token}`, email),
			html: html(`${process.env.DEPLOY_URL}/api/auth/verify/${token}`, email),
			hideWarnings: false,
			mailSettings: { spamCheck: { enable: false } },
		});

		return res.json({
			message: `An email has been sent to you. Click the link to log in or sign up.`,
			response,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}, sessionOptions);

export const text = (url: string, email: string) => `
Welcome to Firefiles!

Click on the link below to log in to Firefiles.
This link will expire in 60 minutes.

${url}

Confirming this request will securely log you in using
${email}.

- Faisal Sayed`;

export const html = (url: string, email: string) => `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<title></title>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		@media (max-width:520px) {
			.row-content {
				width: 100% !important;
			}

			.column .border {
				display: none;
			}

			table {
				table-layout: fixed !important;
			}

			.stack .column {
				width: 100%;
				display: block;
			}
		}
	</style>
</head>
<body style="background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
<table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;" width="500">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td style="width:100%;padding-right:0px;padding-left:0px;">
<div style="line-height:10px"><img src="https://firefiles.vercel.app/logo.png" style="display: block; height: auto; border: 0; width: 100px; max-width: 100%;" width="100"/></div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;" width="500">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" class="heading_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td style="padding-left:10px;text-align:center;width:100%;">
<h1 style="margin: 0; color: #555555; direction: ltr; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 48px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder">Firefiles</span></h1>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;" width="500">
<tbody>
<tr>
<td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" class="paragraph_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td style="padding-left:10px;">
<div style="color:#000000;direction:ltr;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;">
<p style="margin: 0; margin-bottom: 16px;">Click the button below to log in to <strong>Firefiles</strong>.</p>
<p style="margin: 0;">This button will expire in 60 minutes.</p>
</div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="button_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:30px;text-align:left;">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:56px;width:169px;v-text-anchor:middle;" arcsize="8%" strokeweight="1.5pt" strokecolor="#6851ff" fillcolor="#6851ff"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]--><a href="${url}" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#6851ff;border-radius:4px;width:auto;border-top:1px solid #6851ff;font-weight:400;border-right:1px solid #6851ff;border-bottom:1px solid #6851ff;border-left:1px solid #6851ff;padding-top:10px;padding-bottom:10px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;" target="_blank"><span style="padding-left:20px;padding-right:20px;font-size:16px;display:inline-block;letter-spacing:normal;"><span style="font-size: 16px; line-height: 2; word-break: break-word; mso-line-height-alt: 32px;">Log in to Firefiles</span></span></a>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="paragraph_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td style="padding-left:10px;">
<div style="color:#000000;direction:ltr;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;">
<p style="margin: 0;">Button not showing?<strong> <a href="${url}" rel="noopener" style="text-decoration: none; color: #0068a5;" target="_blank">Click here</a></strong></p>
</div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="paragraph_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td style="padding-left:10px;padding-top:20px;">
<div style="color:#000000;direction:ltr;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;">
<p style="margin: 0; margin-bottom: 5px;">Confirming this request will securely log you in using</p>
<p style="margin: 0;"><strong>${email}</strong>.</p>
</div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" class="paragraph_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td style="padding-left:10px;padding-top:30px;">
<div style="color:#000000;direction:ltr;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;">
<p style="margin: 0;"><strong>- Faisal Sayed</strong></p>
</div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
