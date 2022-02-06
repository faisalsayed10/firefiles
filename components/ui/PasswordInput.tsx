import { Button, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import React from "react";

interface Props {
	placeholder: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput: React.FC<Props> = ({ placeholder, value, onChange }) => {
	const [show, setShow] = React.useState(false);
	const handleClick = () => setShow(!show);

	return (
		<InputGroup size="md">
			<Input
				variant="outline"
				value={value}
				onChange={onChange}
				pr="4.5rem"
				type={show ? "text" : "password"}
				placeholder={placeholder}
				required
			/>
			<InputRightElement width="4.5rem">
				<Button h="1.75rem" size="sm" onClick={handleClick}>
					{show ? "Hide" : "Show"}
				</Button>
			</InputRightElement>
		</InputGroup>
	);
};

export default PasswordInput;
