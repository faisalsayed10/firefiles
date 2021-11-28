import { Button } from "@chakra-ui/react";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";

const ProfileButton: React.FC<{ variant: string }> = ({ variant }) => {
	return (
		<Link href="/profile">
			<Button
				leftIcon={<FontAwesomeIcon icon={faUser} />}
				variant={variant}
				colorScheme="cyan">
				Profile
			</Button>
		</Link>
	);
};

export default ProfileButton;
