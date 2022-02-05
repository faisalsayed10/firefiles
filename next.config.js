const removeImports = require("next-remove-imports")();

module.exports = removeImports({
	async rewrites() {
		return [
			{
				source: "/buckets/:id/:folderId*",
				destination: "/buckets/:id"
			}
		];
	},
	images: { domains: ["s.gravatar.com"] },
	experimental: { esmExternals: true }
});
