import { Box, Center, Progress, Text, useColorMode } from "@chakra-ui/react";
import { CurrentlyUploading } from "@util/types";
import React from "react";

type Props = {
  uploadingFiles: CurrentlyUploading[];
};

const UploadProgress: React.FC<Props> = ({ uploadingFiles }) => {
  const { colorMode } = useColorMode();

	return (
		<Center>
			<Box
				borderRadius="sm"
				px="4"
				pos="fixed"
				bottom="5%"
				width={["90vw", "60vw", "60vw"]}
				boxShadow="3.8px 4.1px 6.3px -1.7px rgba(0, 0, 0, 0.2)"
				backgroundColor={colorMode === "dark" ? "gray.700" : "white"}
			>
				{uploadingFiles.map((file) => (
					<Box key={file.id} my="4">
						<Text fontSize="md">{`Uploading ${file.name} (${file.progress}%)`}</Text>
						<Progress hasStripe value={file.progress} height="5px" />
					</Box>
				))}
			</Box>
		</Center>
	);
};

export default UploadProgress;
