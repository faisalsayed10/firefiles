import { Alert, AlertIcon, Flex, FormControl, Input, Link, Text, Textarea } from "@chakra-ui/react";
import VideoAccordion from "@components/ui/VideoAccordion";
import toObject from "convert-to-object";
import { useState } from "react";

const FirebaseInput = ({ setValue, error }) => {
	const [raw, setRaw] = useState("");
	const [name, setName] = useState("");

	return (
		<Flex flexDir="column" maxW="sm" m="0 auto">
			{error && (
				<Alert status="error" fontSize="md" mb="2">
					<AlertIcon />
					{error}
				</Alert>
			)}
			<FormControl mb="2">
				<Input
					variant="flushed"
					placeholder="Name in Firefiles"
					type="text"
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						setValue((prev: any) => ({ ...prev, name: e.target.value }));
					}}
					required
				/>
			</FormControl>
			<FormControl mb="2">
				<Textarea
					autoComplete="off"
					variant="flushed"
					type="text"
					fontSize="sm"
					value={raw}
					minH="200px"
					onChange={(e) => {
						setRaw(e.target.value);
						setValue((prev: any) => ({ name: prev.name, ...toObject(e.target.value) }));
					}}
					required
					placeholder={`{
  apiKey: "AIzafeaubu13ub13j",
  authDomain: "myapp-f3190.firebaseapp.com",
  projectId: "myapp-f3190",
  storageBucket: "myapp-f3190.appspot.com",
  appId: "1:8931361818:web:132af17fejaj3695cf"
}`}
				/>
			</FormControl>
			<Text fontSize="xs" mb="1">
				The fields <strong>apiKey</strong>, <strong>authDomain</strong>, <strong>projectId</strong>,{" "}
				<strong>storageBucket</strong> and <strong>appId</strong> must be present.
			</Text>
			<Text fontSize="xs">
				Make sure you've followed all the{" "}
				<Link href="https://firefiles.vercel.app/docs/hosted" target="_blank" textDecor="underline">
					instructions
				</Link>
				.
			</Text>
			<VideoAccordion src="/firebase-config-tutorial.mov" />
		</Flex>
	);
};

export default FirebaseInput;
