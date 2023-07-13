const removeImports = require("next-remove-imports")();

module.exports = removeImports({
  async rewrites() {
    return [
      {
        source: "/drives/:id/:folderId*",
        destination: "/drives/:id",
      },
    ];
  },
  images: { domains: ["s.gravatar.com"] },
  experimental: { esmExternals: true },
});
