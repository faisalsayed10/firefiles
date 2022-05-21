const removeImports = require("next-remove-imports")();

/** @type {import('next').NextConfig} */
const withNextra = require("nextra")({
	theme: "nextra-theme-docs",
	themeConfig: "./theme.config.js",
	reactStrictMode: true,
	// optional: add `unstable_staticImage: true` to enable Nextra's auto image import
});
module.exports = removeImports(withNextra());
