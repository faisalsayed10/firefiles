import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	User,
	UserCredential
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, firestore } from "./firebase";
import { UserData } from "./types";

type ContextValue = {
	currentUser?: User;
	config?: UserData;
	setConfig: React.Dispatch<React.SetStateAction<UserData>>;
	login: (email: string, password: string) => Promise<any>;
	signup: (email: string, password: string) => Promise<UserCredential>;
	logout: () => Promise<void>;
};

const AuthContext = createContext<ContextValue>({
	currentUser: null,
	config: null,
	setConfig: () => null,
	login: () => null,
	signup: () => null,
	logout: () => null
});

export default function useUser() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState<User>();
	const [config, setConfig] = useState<UserData>();
	const [loading, setLoading] = useState(true);

	const login = async (email: string, password: string) => {
		try {
			const { user } = await signInWithEmailAndPassword(auth, email, password);
			if (user) {
				const userDoc = await getDoc(doc(firestore, "users", user.uid));
				if (userDoc.exists()) {
					const data = userDoc.data() as UserData;
					setConfig(data);
					return data;
				} else {
					return null;
				}
			}
		} catch (err) {
			return err;
		}
	};

	const signup = async (email: string, password: string) => {
		return createUserWithEmailAndPassword(auth, email, password);
	};

	const logout = async () => {
		setConfig(null);
		return await signOut(auth);
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user);
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const value = { currentUser, login, logout, signup, config, setConfig };
	return <AuthContext.Provider value={value}>{!loading ? children : <div />}</AuthContext.Provider>;
}
