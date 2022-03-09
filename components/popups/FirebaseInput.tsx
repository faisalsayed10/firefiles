import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Alert,
	AlertIcon,
	Flex,
	FormControl,
	Link,
	Text,
	Textarea,
} from "@chakra-ui/react";
import { LoadingSpinner, Player } from "video-react";

const FirebaseInput = ({ value, setValue, error }) => {
	return (
		<Flex flexDir="column" maxW="sm" m="0 auto">
			<Text as="h2" fontSize="2xl" align="center" mb="2">
				Paste your Firebase Credentials
			</Text>
			{error && (
				<Alert status="error" fontSize="md" mb="2">
					<AlertIcon />
					{error}
				</Alert>
			)}
			<FormControl mb="2">
				<Textarea
					autoComplete="off"
					variant="outline"
					type="text"
					fontSize="sm"
					value={value}
					minH="150px"
					onChange={(e) => setValue(e.target.value)}
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
			<Text fontSize="xs">
				The fields <strong>apiKey</strong>, <strong>authDomain</strong>, <strong>projectId</strong>,{" "}
				<strong>storageBucket</strong> and <strong>appId</strong> must be present in the JSON.
			</Text>
			<Text fontSize="xs">
				Make sure you've followed all the{" "}
				<Link
					href="https://firefiles.vercel.app/docs/hosted"
					target="_blank"
					color="blue.600"
					textDecor="underline"
				>
					instructions
				</Link>
				.
			</Text>
			<Accordion allowToggle>
				<AccordionItem border="none">
					<AccordionButton pl="0">
						<Text flex="1" textAlign="left">
							Here's how you get the keys:
						</Text>
						<AccordionIcon />
					</AccordionButton>
					<AccordionPanel>
						<Player playsInline src="/firebase-config-tutorial.mov">
							<LoadingSpinner />
						</Player>
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
		</Flex>
	);
};

export default FirebaseInput;
