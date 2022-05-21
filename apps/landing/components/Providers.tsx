const PROVIDERS = [
	{ name: "Firebase", src: "/logos/firebase.png", comingSoon: false },
	{ name: "AWS", src: "/logos/amazonaws.png", comingSoon: false },
	{ name: "Digital Ocean", src: "/logos/digitalocean.png", comingSoon: true },
	{ name: "Backblaze", src: "/logos/backblaze.png", comingSoon: true },
	{ name: "Scaleway", src: "/logos/scaleway.png", comingSoon: true },
	// { name: "Cloudflare", src: "/logos/cloudflare.png", comingSoon: true },
	{ name: "Cloudinary", src: "/logos/cloudinary.png", comingSoon: true },
	// { name: "Wasabi", src: "/logos/wasabi.png", comingSoon: true },
	{ name: "Azure", src: "/logos/azure.png", comingSoon: true },
	{ name: "Supabase", src: "/logos/supabase.png", comingSoon: true },
	// { name: "Linode", src: "/logos/linode.png", comingSoon: true },
	{ name: "Deta", src: "/logos/deta.png", comingSoon: true },
];

const Providers = () => {
	return (
		<div className="flex items-center flex-col mt-10 py-12 relative z-10">
			<h3 className="text-indigo-500 font-normal tracking-wider mb-12 text-center">
				THE LAST CLOUD STORAGE YOU'LL EVER NEED
			</h3>
			<div className="flex justify-evenly w-full flex-wrap max-w-4xl px-10 gap-x-10 gap-y-5">
				{PROVIDERS.map((p) => (
					<div
						key={p.name}
						className="tooltip my-auto"
						data-tip={p.comingSoon ? "Coming really soon!" : "✨ Try it right now!"}
					>
						<img
							className={`max-h-14 max-w-[56px] object-contain ${p.comingSoon && "opacity-40"}`}
							src={p.src}
							alt={p.name}
						/>
					</div>
				))}
			</div>
			<h3 className="mt-6">You name it, we'll add it.</h3>
		</div>
	);
};

export default Providers;
