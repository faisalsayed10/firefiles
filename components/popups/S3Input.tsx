import { Alert, AlertIcon, Flex, FormControl, Input, Text } from "@chakra-ui/react";
import AWSRegionSelect from "@components/ui/AWSRegionSelect";
import VideoAccordion from "@components/ui/VideoAccordion";
import { useState } from "react";

const S3Input = ({ setValue, error }) => {
	const [name, setName] = useState("");
	const [accessKey, setAccessKey] = useState("");
	const [secretKey, setSecretKey] = useState("");
	const [bucketName, setBucketName] = useState("");
	const [region, setRegion] = useState("");

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
						setValue((prev) => ({ ...prev, name: e.target.value }));
					}}
					required
				/>
			</FormControl>
			<FormControl mb="2">
				<Input
					variant="flushed"
					placeholder="Access Key ID"
					type="text"
					value={accessKey}
					onChange={(e) => {
						setAccessKey(e.target.value);
						setValue((prev) => ({ ...prev, accessKey: e.target.value }));
					}}
					required
				/>
			</FormControl>
			<FormControl mb="2">
				<Input
					variant="flushed"
					placeholder="Secret Access Key"
					type="text"
					value={secretKey}
					onChange={(e) => {
						setSecretKey(e.target.value);
						setValue((prev) => ({ ...prev, secretKey: e.target.value }));
					}}
					required
				/>
			</FormControl>
			<FormControl mb="2">
				<Input
					variant="flushed"
					placeholder="S3 Bucket Name"
					type="text"
					value={bucketName}
					onChange={(e) => {
						setBucketName(e.target.value);
						setValue((prev) => ({ ...prev, bucketName: e.target.value }));
					}}
					required
				/>
			</FormControl>
			<FormControl mb="2">
				<AWSRegionSelect value={region} setValue={setRegion} />
			</FormControl>
			<Text as="p" fontSize="xs">
				We'll create a new AWS bucket in this region if the bucket with provided name doesn't exist.
			</Text>
			<VideoAccordion src="/aws-keys-tutorial.mov" />
		</Flex>
	);
};

export default S3Input;
