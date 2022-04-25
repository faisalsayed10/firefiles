import { Box, Flex, IconButton, Progress, Text } from "@chakra-ui/react";
import { CurrentlyUploading } from "@util/types";
import React from "react";
import toast from "react-hot-toast";
import { PlayerPause, PlayerPlay, X } from "tabler-icons-react";

type Props = {
	file: CurrentlyUploading;
	setUploadingFiles: React.Dispatch<React.SetStateAction<CurrentlyUploading[]>>;
};

const UploadProgress: React.FC<Props> = ({ file, setUploadingFiles }) => {
	return (
		<Flex align="baseline">
			<Box my="4" flex="1">
				<Text fontSize="md">{`Uploading ${file.name} (${file.progress}%)`}</Text>
				<Progress
					hasStripe
					isAnimated={file.state === "running"}
					value={file.progress}
					height="5px"
				/>
			</Box>
			<IconButton
				onClick={() => (file.state === "running" ? file.task.pause() : file.task.resume())}
				variant="link"
				isDisabled={file.state === "error"}
				aria-label="pause"
				icon={file.state === "running" ? <PlayerPause /> : <PlayerPlay />}
			/>
			<IconButton
				onClick={() => {
					file.task.cancel();
					setUploadingFiles((prev) => prev.filter((f) => f.id !== file.id));
					toast.error("File upload cancelled.");
				}}
				variant="link"
				aria-label="cancel"
				icon={<X />}
			/>
		</Flex>
	);
};

export default UploadProgress;
