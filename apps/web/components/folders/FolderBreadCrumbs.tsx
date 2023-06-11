import { HomeIcon } from "@heroicons/react/20/solid";
import { DriveFolder } from "@util/types";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

interface Props {
	currentFolder: DriveFolder;
}

const FolderBreadCrumbs: React.FC<Props> = ({ currentFolder }) => {
	const router = useRouter();

	if (!currentFolder) return null;

	return (
		<nav className="flex border-b border-gray-200 bg-white" aria-label="Breadcrumb">
			<ol
				role="list"
				className="mx-auto flex w-full max-w-screen-xl space-x-4 px-4 sm:px-6 lg:px-8"
			>
				<li className="flex">
					<div className="flex items-center">
						<Link
							href={router.asPath.replace(
								currentFolder.fullPath.slice(0, -1).replace(" ", "%20"),
								""
							)}
							className="text-gray-400 hover:text-gray-500"
						>
							<HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
							<span className="sr-only">Home</span>
						</Link>
					</div>
				</li>
				{currentFolder?.name !== "" &&
					currentFolder?.fullPath
						.slice(0, -1)
						.split("/")
						.map((path, i) => (
							<li key={path} className="flex">
								<div className="flex items-center">
									<svg
										className="h-full w-6 flex-shrink-0 text-gray-200"
										viewBox="0 0 24 44"
										preserveAspectRatio="none"
										fill="currentColor"
										aria-hidden="true"
									>
										<path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
									</svg>
									<Link
										href={(() => {
											const route =
												currentFolder.fullPath
													.slice(0, -1)
													.substring(0, currentFolder.fullPath.slice(0, -1).indexOf(path)) + path;

											return `${router.asPath.replace(
												currentFolder.fullPath.slice(0, -1).replace(" ", "%20"),
												""
											)}${route}`;
										})()}
										className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
										// aria-current={page.current ? "page" : undefined}
									>
										{decodeURIComponent(path)}
									</Link>
								</div>
							</li>
						))}
			</ol>
		</nav>
	);
};

export default FolderBreadCrumbs;
