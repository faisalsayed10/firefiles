import { Flex, FormControl, Input, Text } from "@chakra-ui/react";
import AWSRegionSelect from "@components/ui/AWSRegionSelect";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const S3Input = ({ setValue, error }) => {
	const [accessKey, setAccessKey] = useState("");
	const [secretKey, setSecretKey] = useState("");
	const [bucketName, setBucketName] = useState("");
	const [region, setRegion] = useState("");

	useEffect(() => {
		if (!error.trim()) return;
		toast.error(error);
	}, [error]);

	return (
		<Flex flexDir="column" maxW="sm" m="0 auto">
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
				<AWSRegionSelect
					value={region}
					onChange={(e) => {
						setRegion(e.target.value);
						setValue((prev) => ({ ...prev, region: e.target.value }));
					}}
				/>
			</FormControl>
			<Text as="p" fontSize="xs">
				We'll create a new AWS bucket in this region if the bucket with provided name doesn't exist.
			</Text>
			{/* TODO: <VideoAccordion src="/aws-keys-tutorial.mov" /> */}
		</Flex>
	);
};

export default S3Input;
