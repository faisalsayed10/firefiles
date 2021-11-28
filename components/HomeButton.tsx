import React from "react";
import Link from "next/link";
import { Button } from "@chakra-ui/react";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const HomeButton: React.FC<{ variant: string }> = ({ variant }) => {
	return (
		<Link href="/">
			<Button
				leftIcon={<FontAwesomeIcon icon={faHome} />}
				variant={variant}
				colorScheme="cyan">
				Home
			</Button>
		</Link>
	);
};

export default HomeButton;
