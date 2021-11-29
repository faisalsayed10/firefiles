import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { FolderCollection } from "@util/types";
import { ROOT_FOLDER } from "@util/useFolder";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

interface Props {
	currentFolder: FolderCollection;
}

const FolderBreadCrumbs: React.FC<Props> = ({ currentFolder }) => {
	const router = useRouter();
	const [path, setPath] = useState<FolderCollection[]>([]);

	useEffect(() => {
		if (currentFolder) {
			if (currentFolder === ROOT_FOLDER) {
				setPath([]);
			} else {
				setPath([ROOT_FOLDER, ...currentFolder.path]);
			}
		}
	}, [currentFolder]);

	return (
		<Breadcrumb
			fontWeight="medium"
			whiteSpace="nowrap"
			isTruncated={true}
			width="100%"
			px={["2", "6", "8"]}
			pt="4"
			fontSize="xl">
			{path.map((folder, i) => {
				return (
					<BreadcrumbItem key={folder.id || i} maxW="175px" p="3px">
						<BreadcrumbLink
							display="inline-block"
							isTruncated={true}
							color="rgb(0, 119, 255)"
							onClick={() => {
								const query = `?folder=${JSON.stringify({ ...folder, path: path.slice(1, i) })}`;
								const route = folder.id ? `/folder/${folder.id}` : "/";
								router.push(route + query, route);
							}}>
							{folder.name === "Root" ? "~" : folder.name}
						</BreadcrumbLink>
					</BreadcrumbItem>
				);
			})}
			{currentFolder && (
				<BreadcrumbItem p="3px" maxW="175px" isCurrentPage>
					<BreadcrumbLink display="inline-block" isTruncated={true}>
						{currentFolder.name === "Root" ? "~" : currentFolder.name}
					</BreadcrumbLink>
				</BreadcrumbItem>
			)}
		</Breadcrumb>
	);
};

export default FolderBreadCrumbs;
