import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Text,
} from "@chakra-ui/react";
import React from "react";
import { Player } from "video-react";

type Props = {
	src: string;
};

const VideoAccordion: React.FC<Props> = ({ src }) => {
	return (
		<Accordion allowToggle>
			<AccordionItem border="none">
				<AccordionButton pl="0">
					<Text flex="1" textAlign="left">
						Here's how you get the keys:
					</Text>
					<AccordionIcon />
				</AccordionButton>
				<AccordionPanel>
					<Player playsInline src={src} />
				</AccordionPanel>
			</AccordionItem>
		</Accordion>
	);
};

export default VideoAccordion;
