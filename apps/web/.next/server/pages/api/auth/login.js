"use strict";
(() => {
var exports = {};
exports.id = 908;
exports.ids = [908];
exports.modules = {

/***/ 2139:
/***/ ((module) => {

module.exports = require("@sendgrid/mail");

/***/ }),

/***/ 9344:
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ 4275:
/***/ ((module) => {

module.exports = require("resend");

/***/ }),

/***/ 1564:
/***/ ((module) => {

module.exports = require("validator");

/***/ }),

/***/ 4014:
/***/ ((module) => {

module.exports = import("iron-session");;

/***/ }),

/***/ 3896:
/***/ ((module) => {

module.exports = import("lru-cache");;

/***/ }),

/***/ 6043:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "html": () => (/* binding */ html),
/* harmony export */   "text": () => (/* binding */ text)
/* harmony export */ });
/* harmony import */ var _util_rate_limit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5810);
/* harmony import */ var _util_session__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8899);
/* harmony import */ var iron_session_next__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8882);
/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9344);
/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var validator__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1564);
/* harmony import */ var validator__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(validator__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var resend__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(4275);
/* harmony import */ var resend__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(resend__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _sendgrid_mail__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2139);
/* harmony import */ var _sendgrid_mail__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_sendgrid_mail__WEBPACK_IMPORTED_MODULE_6__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_util_rate_limit__WEBPACK_IMPORTED_MODULE_0__, iron_session_next__WEBPACK_IMPORTED_MODULE_2__]);
([_util_rate_limit__WEBPACK_IMPORTED_MODULE_0__, iron_session_next__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);







if (typeof process.env.SENDGRID_API_KEY === "undefined") {
    const resend = new resend__WEBPACK_IMPORTED_MODULE_5__.Resend(process.env.RESEND_API_KEY);
} else {
    _sendgrid_mail__WEBPACK_IMPORTED_MODULE_6___default().setApiKey(process.env.SENDGRID_API_KEY);
}
const url = process.env.VERCEL_URL || process.env.DEPLOY_URL;
const limiter = (0,_util_rate_limit__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)({
    interval: 5 * 60 * 1000,
    uniqueTokenPerInterval: 500
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,iron_session_next__WEBPACK_IMPORTED_MODULE_2__/* .withIronSessionApiRoute */ .n)(async (req, res)=>{
    try {
        await limiter.check(res, 5, "CACHE_TOKEN"); // 5 requests per 5 minutes
    } catch (error) {
        return res.status(429).json({
            error: "Too many requests. Please try again after 5 minutes."
        });
    }
    const { email  } = req.body;
    if (!validator__WEBPACK_IMPORTED_MODULE_4___default().isEmail(email)) return res.status(400).json({
        error: "The email you provided is invalid."
    });
    try {
        const token = await jsonwebtoken__WEBPACK_IMPORTED_MODULE_3___default().sign({
            email
        }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: process.env.EMAIL_FROM,
                to: email,
                html: html(`${url}/api/auth/verify/${token}`, email),
                text: text(`${url}/api/auth/verify/${token}`, email),
                subject: "Log in to Firefiles",
                tags: [
                    {
                        name: "firefiles",
                        value: "login_link"
                    }
                ]
            });
            return res.json({
                message: `An email has been sent to you. Click the link to log in or sign up.`
            });
        } else {
            await _sendgrid_mail__WEBPACK_IMPORTED_MODULE_6___default().send({
                from: process.env.EMAIL_FROM,
                to: email,
                html: html(`${url}/api/auth/verify/${token}`, email),
                text: text(`${url}/api/auth/verify/${token}`, email),
                subject: "Log in to Firefiles",
                categories: [
                    "firefiles",
                    "login_link"
                ]
            });
            return res.json({
                message: `An email has been sent to you. Click the link to log in or sign up.`
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}, _util_session__WEBPACK_IMPORTED_MODULE_1__/* .sessionOptions */ .d));
const text = (url, email)=>`
Welcome to Firefiles!

Click on the link below to log in to Firefiles.
This link will expire in 60 minutes.

${url}

Confirming this request will securely log you in using
${email}.

- Faisal Sayed`;
const html = (url, email)=>`<!DOCTYPE html>
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

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 5810:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var lru_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3896);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([lru_cache__WEBPACK_IMPORTED_MODULE_0__]);
lru_cache__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

const rateLimit = (options)=>{
    const tokenCache = new lru_cache__WEBPACK_IMPORTED_MODULE_0__["default"]({
        max: parseInt(options.uniqueTokenPerInterval || 500, 10),
        ttl: parseInt(options.interval || 60000, 10)
    });
    return {
        check: (res, limit, token)=>new Promise((resolve, reject)=>{
                const tokenCount = tokenCache.get(token) || [
                    0
                ];
                if (tokenCount[0] === 0) {
                    tokenCache.set(token, tokenCount);
                }
                tokenCount[0] += 1;
                const currentUsage = tokenCount[0];
                const isRateLimited = currentUsage > parseInt(limit, 10);
                res.setHeader("X-RateLimit-Limit", limit);
                res.setHeader("X-RateLimit-Remaining", isRateLimited ? 0 : limit - currentUsage);
                return isRateLimited ? reject() : resolve("OK");
            })
    };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (rateLimit);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 8899:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "d": () => (/* binding */ sessionOptions)
/* harmony export */ });
const sessionOptions = {
    password: process.env.COOKIE_PASSWORD,
    cookieName: "auth-session",
    cookieOptions: {
        secure: "production" === "production",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15)
    }
};


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [882], () => (__webpack_exec__(6043)));
module.exports = __webpack_exports__;

})();