import { Flex, useColorModeValue } from "@chakra-ui/react";
import { useRouter } from "next/router";
import "node_modules/video-react/dist/video-react.css";
import React from "react";
import { Plus } from "tabler-icons-react";

const AddDriveButton = () => {
	const router = useRouter();

	return (
		<>
			<Flex
				direction="column"
				align="center"
				justify="center"
				transition="ease-in-out 0.1s"
				cursor="pointer"
				className="hoverAnim"
				color={useColorModeValue("#2D3748", "white")}
				w="full"
				h="140px"
				borderWidth="1px"
				borderRadius="lg"
				boxShadow="5.5px 4.2px 7.8px -1.7px rgba(0, 0, 0, 0.1)"
				onClick={() => router.push("/new")}
			>
				<Plus size={72} strokeWidth="1px" />
			</Flex>
		</>
	);
};

export default AddDriveButton;
