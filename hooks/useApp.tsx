import { Flex, Spinner, Text } from "@chakra-ui/react";
import { Config } from "@util/types";
import axios from "axios";
import { deleteApp, FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
	createUserWithEmailAndPassword,
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	User
} from "firebase/auth";
import { nanoid } from "nanoid";
import router from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import useUser from "./useUser";

type ContextValue = {
	app?: FirebaseApp;
	config?: Config;
	appUser?: User;
	onLogout?: () => void;
	onConfigChange?: (newConfig: Config) => void;
};

const AppContext = createContext<ContextValue>({});

export default function useApp() {
	return useContext(AppContext);
}

export function AppProvider({ children }) {
	const [app, setApp] = useState<FirebaseApp>();
	const [config, setConfig] = useState<Config>();
	const [appUser, setAppUser] = useState<User>();
	const [loading, setLoading] = useState(false);
	const { currentUser, loading: userLoading } = useUser();

	const onLogout = async () => {
		await signOut(getAuth(app));
		deleteApp(app);
		setApp(undefined);
		setConfig(undefined);
		window.localStorage.removeItem("has_logged_in");
	};

	const onConfigChange = async (newConfig: Config) => {
		if (app) {
			await deleteApp(app);
			signOut(getAuth(app));
		}
		initializeAppAndLogin(newConfig, false);
	};

	const initializeAppAndLogin = async (data: Config, has_logged_in: boolean) => {
		setConfig(data);
		const initialize = initializeApp(data, currentUser.uid);
		setApp(initialize);

		if (!has_logged_in) {
			await loginTheirUser(initialize, currentUser);
		}
	};

	useEffect(() => {
		if (!currentUser || router.pathname === "/error") return;
		const has_initialized = getApps().filter((app) => app.name === currentUser.uid).length > 0;
		const has_logged_in = window.localStorage.getItem("has_logged_in") === "true" || false;

		try {
			if (!has_initialized) {
				(async () => {
					setLoading(true);
					const token = await currentUser.getIdToken();
					const { data } = await axios.get("/api/config", {
						headers: { uid: currentUser.uid, token }
					});

					if (data) await initializeAppAndLogin(data, has_logged_in);
					setLoading(false);
				})();
			} else if (has_initialized) {
				const initialized = getApp(currentUser.uid);
				setApp(initialized);
				setConfig(initialized.options);
			}
		} catch (err) {
			console.error(err);
		}
	}, [currentUser]);

	useEffect(() => {
		if (!app) return;

		const unsubscribe = onAuthStateChanged(getAuth(app), (user) => {
			setAppUser(user);
		});

		return unsubscribe;
	}, [app]);

	return (
		<AppContext.Provider value={{ app, config, onLogout, onConfigChange, appUser }}>
			{!loading && !userLoading ? (
				children
			) : (
				// Maybe add fun facts here instead of generic text (like discord)
				<Flex minH="100vh" align="center" justify="center" flexDir="column">
					<Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
					<Text mt="2" fontSize="lg">
						Just a moment...
					</Text>
				</Flex>
			)}
		</AppContext.Provider>
	);
}

const loginTheirUser = async (app: FirebaseApp, user: User) => {
	const auth = getAuth(app);
	const config = app.options as Config;
	const setLoggedIn = () => window.localStorage.setItem("has_logged_in", "true");
	const email = user.email.split("@")[0] + "+firefiles@" + user.email.split("@")[1];
	let password: string;

	if (config.password) {
		password = config.password;
	} else {
		password = nanoid(Math.floor(Math.random() * (30 - 20)) + 20);
	}

	await signInWithEmailAndPassword(auth, email, password)
		.then(() => setLoggedIn())
		.catch(async (err) => {
			if (err.message.includes("auth/user-not-found")) {
				await createUserWithEmailAndPassword(auth, email, password).then(() => setLoggedIn());
			} else {
				if (router.pathname !== "/config") router.push("/error?message=" + err.message);
			}
		});

	if (!config.password) {
		await axios.post(
			"/api/config",
			{ ...config, password },
			{ headers: { uid: user.uid, token: await user.getIdToken() } }
		);
	}
};
