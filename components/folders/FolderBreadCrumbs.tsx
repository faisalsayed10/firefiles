import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, useColorMode } from "@chakra-ui/react";
import { DriveFolder } from "@util/types";
import { useRouter } from "next/router";
import React from "react";
import { ChevronRight, Home } from "tabler-icons-react";

interface Props {
	currentFolder: DriveFolder;
}

const FolderBreadCrumbs: React.FC<Props> = ({ currentFolder }) => {
	const router = useRouter();
	const { colorMode } = useColorMode();

	return (
		<Breadcrumb
			// @ts-ignore
			overflowX="auto"
			fontWeight="medium"
			whiteSpace="nowrap"
			isTruncated={true}
			width="100%"
			px={["2", "6", "8"]}
			my={2}
			separator={<ChevronRight />}
			fontSize="lg"
		>
			<BreadcrumbItem p="3px" maxW="175px" isCurrentPage>
				<BreadcrumbLink
					display="inline-block"
					isTruncated={true}
					_hover={{ textDecor: "none" }}
					textColor={colorMode === "light" ? "#2D3748" : "white"}
					onClick={() =>
						router.push(
							router.asPath.replace(currentFolder.fullPath.slice(0, -1).replace(" ", "%20"), "")
						)
					}
				>
					<Home />
				</BreadcrumbLink>
			</BreadcrumbItem>
			{currentFolder?.name !== "" &&
				currentFolder?.fullPath
					.slice(0, -1)
					.split("/")
					.map((path, i) => {
						return (
							<BreadcrumbItem key={path || i} maxW="175px" p="3px">
								<BreadcrumbLink
									display="inline-block"
									textColor={colorMode === "light" ? "#2D3748" : "white"}
									isTruncated={true}
									color="rgb(0, 119, 255)"
									onClick={() => {
										const route =
											currentFolder.fullPath
												.slice(0, -1)
												.substring(0, currentFolder.fullPath.slice(0, -1).indexOf(path)) + path;

										router.push(
											`${router.asPath.replace(
												currentFolder.fullPath.slice(0, -1).replace(" ", "%20"),
												""
											)}${route}`
										);
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
