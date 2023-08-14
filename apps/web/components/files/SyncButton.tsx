import { IconButton, Input, useColorModeValue } from "@chakra-ui/react";
import useBucket from "@hooks/useBucket";
import useKeys from "@hooks/useKeys";
import { Provider } from "@util/types";
import { nanoid } from "nanoid";
import React, { useEffect, useRef } from "react";
import { Refresh } from "tabler-icons-react";
import useFirebase from '@hooks/useFirebase'

interface Props {
}

const SyncButton: React.FC<Props> = ({ }) => {
	const { loading } = useBucket();
	const { syncFilesInCurrentFolder } = useFirebase();

	// handleSync to be completed
	const handleSync = async () => {
		try {
			await syncFilesInCurrentFolder();
		} catch (error) {
			console.error("Error syncing files:", error);
		}
	};

	return (
		<>
			<IconButton
				disabled={loading}
				pos="fixed"
				p="4"
				borderRadius="50%"
				w="60px"
				h="60px"
				bottom="2rem"
				right="7rem"
				variant="outline"
				bgColor={useColorModeValue("white", "#1a202c")}
				_focus={{ outline: "none" }}
				_hover={{ opacity: 1 }}
				boxShadow="4.2px 4px 6.5px -1.7px rgba(0, 0, 0, 0.4)"
				colorScheme="yellow"
				aria-label="sync file"
				// onClick to be completed
				onClick={handleSync}
			>
				<Refresh size="42px" />
			</IconButton>
		</>
	);
};

export default SyncButton;
