export default {
	projectLink: "https://github.com/faisalsayed10/firefiles",
	docsRepositoryBase: "https://github.com/faisalsayed10/firefiles-landing/blob/main",
	titleSuffix: " – Firefiles",
	nextLinks: true,
	prevLinks: true,
	search: true,
	customSearch: null,
	darkMode: true,
	footer: true,
	footerText: `GNU GPL-3.0 ${new Date().getFullYear()} © Faisal Sayed.`,
	footerEditLink: `Edit this page on GitHub`,
	logo: (
		<>
			<img src="/logo.png" width="32" height="32" />
			<span style={{ marginLeft: "2px" }}>Firefiles</span>
		</>
	),
	head: (
		<>
			<link rel="icon" href="/logo.png" type="image/png" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta name="description" content="Get your own file hosting service in minutes." />
			<meta name="og:title" content="Firefiles" />
		</>
	)
};
