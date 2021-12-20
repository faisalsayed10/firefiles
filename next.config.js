module.exports = {
	async rewrites() {
		return [
			{
				source: "/folder/:id*",
				destination: "/"
			}
		];
	}
};
