import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, useColorMode } from "@chakra-ui/react";
import { faChevronRight, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
	const { colorMode } = useColorMode();

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
			// @ts-ignore
			overflowX="scroll !important"
			fontWeight="medium"
			whiteSpace="nowrap"
			isTruncated={true}
			width="100%"
			px={["2", "6", "8"]}
			separator={<FontAwesomeIcon icon={faChevronRight} />}
			fontSize="lg"
		>
			{path.map((folder, i) => {
				return (
					<BreadcrumbItem key={folder.id || i} maxW="175px" p="3px">
						<BreadcrumbLink
							display="inline-block"
							textColor={colorMode === "light" ? "#2D3748" : "white"}
							isTruncated={true}
							color="rgb(0, 119, 255)"
							onClick={() => {
								const parentPath = folder.path?.map((p) => p.id).join("/");
								const route = folder.id
									? `/folder${parentPath !== "" ? "/" + parentPath + "/" : "/"}${folder.id}`
									: "/";
								router.push(route);
							}}
						>
							{folder.name === "Root" ? <FontAwesomeIcon icon={faHome} /> : folder.name}
						</BreadcrumbLink>
					</BreadcrumbItem>
				);
			})}
			{currentFolder && (
				<BreadcrumbItem p="3px" maxW="175px" isCurrentPage>
					<BreadcrumbLink
						display="inline-block"
						isTruncated={true}
						_hover={{ textDecor: "none" }}
						textColor={colorMode === "light" ? "#2D3748" : "white"}
					>
						{currentFolder.name === "Root" ? <FontAwesomeIcon icon={faHome} /> : currentFolder.name}
					</BreadcrumbLink>
				</BreadcrumbItem>
			)}
		</Breadcrumb>
	);
};

export default FolderBreadCrumbs;
