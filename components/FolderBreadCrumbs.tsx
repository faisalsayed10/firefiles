import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, useColorMode } from "@chakra-ui/react";
import { StorageReference } from "@firebase/storage";
import { faChevronRight, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import React from "react";

interface Props {
	currentFolder: StorageReference;
}

const FolderBreadCrumbs: React.FC<Props> = ({ currentFolder }) => {
	const router = useRouter();
	const { colorMode } = useColorMode();

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
			<BreadcrumbItem p="3px" maxW="175px" isCurrentPage>
				<BreadcrumbLink
					display="inline-block"
					isTruncated={true}
					_hover={{ textDecor: "none" }}
					textColor={colorMode === "light" ? "#2D3748" : "white"}
					onClick={() => router.push("/")}
				>
					<FontAwesomeIcon icon={faHome} />
				</BreadcrumbLink>
			</BreadcrumbItem>
			{currentFolder?.name !== "" &&
				currentFolder?.fullPath.split("/").map((path, i) => {
					return (
						<BreadcrumbItem key={path || i} maxW="175px" p="3px">
							<BreadcrumbLink
								display="inline-block"
								textColor={colorMode === "light" ? "#2D3748" : "white"}
								isTruncated={true}
								color="rgb(0, 119, 255)"
								onClick={() => {
									const route =
										currentFolder.fullPath.substring(0, currentFolder.fullPath.indexOf(path)) +
										path;
									router.push(`/folder/${route}`);
								}}
							>
								{decodeURIComponent(path)}
							</BreadcrumbLink>
						</BreadcrumbItem>
					);
				})}
		</Breadcrumb>
	);
};

export default FolderBreadCrumbs;
