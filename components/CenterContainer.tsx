import { Container } from "@chakra-ui/react";
import React from "react";

const CenterContainer = ({ children }) => {
	return (
		<Container display="flex" alignItems="center" justifyContent="center" minH="100vh">
			{children}
		</Container>
	);
};

export default CenterContainer;
