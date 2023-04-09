import { PROVIDERS } from "@util/globals";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { ArrowNarrowLeft } from "tabler-icons-react";
import Image from "next/image";

const New = () => {
	const router = useRouter();

	return (
		<>
			<Head>
				<title>Create New Drive | Firefiles</title>
			</Head>
			<div className="px-4 pt-3">
				<button aria-label="back" className="mr-3" onClick={() => router.push("/new")}>
					<ArrowNarrowLeft />
				</button>
				<h3 className="text-lg">Add a new drive</h3>
			</div>
			<div className="flex min-h-screen flex-col items-center justify-center max-w-lg">
				<div className="flex-1 p-5 border rounded-lg overflow-hidden">
					<div className="grid-cols-2 gap-4">
						{PROVIDERS.map((p) => (
							<div
								key={p.id}
								className="hoverAnim flex relative cursor-pointer items-center flex-col max-w-[100px] max-h-[100px] transition-all ease-in-out duration-100"
								onClick={() => {
									if (p.isComingSoon) return;
									router.push(`/new/${p.id}`);
								}}
							>
								<Image src={p.logo} className="h-20" alt="Provider logo" />
								<p className="align-center mt-2">{p.name}</p>
								{/* {p.isComingSoon ? (
									<Badge colorScheme="purple" pos="absolute" fontSize="xs" bottom="50%">
										COMING SOON
									</Badge>
								) : null} */}
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};

export default New;
