import { Link, Text } from "@chakra-ui/layout";
import React from "react";

const Footer = () => {
	return (
		<Text align="center" mt="4">
			Made with ♥ by Faisal |{" "}
			<Link
				href="https://github.com/faisalsayed10/firefiles/tree/self-host"
				textDecor="underline"
				target="_blank"
			>
				Open Source
			</Link>
		</Text>
	);
};

export default Footer;
