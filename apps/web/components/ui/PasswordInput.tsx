import { useState } from "react";

interface Props {
	placeholder: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput: React.FC<Props> = ({ placeholder, value, onChange }) => {
	const [show, setShow] = useState(false);
	const handleClick = () => setShow(!show);

	return (
		<div>
			<input
				type={show ? "text" : "password"}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required
			/>
			<button onClick={handleClick}>{show ? "Hide" : "Show"}</button>
		</div>
	);
};

export default PasswordInput;
