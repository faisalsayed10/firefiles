import { auth } from "@util/firebase";
import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signOut,
	User
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

type ContextValue = {
	currentUser?: User;
	loading?: boolean;
	login?: (email: string, password: string) => Promise<any>;
	signup?: (email: string, password: string) => Promise<any>;
	reset?: (email: string) => Promise<any>;
	logout?: () => Promise<void>;
};

const AuthContext = createContext<ContextValue>({});

export default function useUser() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState<User>();
	const [loading, setLoading] = useState(true);

	const login = async (email: string, password: string) => {
		return signInWithEmailAndPassword(auth, email, password);
	};

	const signup = async (email: string, password: string) => {
		return createUserWithEmailAndPassword(auth, email, password);
	};

	const reset = async (email: string) => {
		return sendPasswordResetEmail(auth, email);
	};

	const logout = async () => {
		return signOut(auth);
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setCurrentUser(user);
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	return (
		<AuthContext.Provider value={{ currentUser, login, logout, signup, reset, loading }}>
			{children}
		</AuthContext.Provider>
	);
}
