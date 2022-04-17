import { Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import "node_modules/video-react/dist/video-react.css";
import React from "react";
import { Plus } from "tabler-icons-react";

const AddBucketButton = () => {
	const router = useRouter();

	return (
		<>
			<Flex
				align="center"
				justify="center"
				h="110px"
				boxShadow="0 3px 10px rgb(0,0,0,0.2)"
				transition="ease-in-out 0.1s"
				cursor="pointer"
				className="hoverAnim"
				onClick={() => router.push("/new")}
			>
				<Plus size={72} />
			</Flex>
		</>
	);
};

export default AddBucketButton;
