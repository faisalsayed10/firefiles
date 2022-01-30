module.exports = {
	async rewrites() {
		return [
			{
				source: "/buckets/:id/:folderId*",
				destination: "/buckets/:id"
			}
		];
	},
	images: {
		domains: ["s.gravatar.com"]
	}
};
