module.exports = {
	async rewrites() {
		return [
			{
				source: "/folder/:id*",
				destination: "/"
			}
		];
	},
	images: {
		domains: ["s.gravatar.com"]
	}
};
