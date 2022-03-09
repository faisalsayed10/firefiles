import { auth } from "@util/firebase";
import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	sendEmailVerification,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signOut,
	User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import nookies from "nookies";

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

	const verifyEmail = async (user: User) => {
		try {
			await sendEmailVerification(user);
			await signOut(auth);
			toast.success(
				"An email has been sent to your address. Please verify your email and log in again.",
				{ duration: 5000 }
			);
			setLoading(false);
		} catch (err) {
			toast.error(err.message.replace("Firebase: ", ""));
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user && !user.emailVerified) {
				await verifyEmail(user);
				return;
			}

			if (!user) {
				setCurrentUser(null);
				nookies.destroy(null, "token");
				nookies.set(undefined, "token", "", { path: "/" });
			} else {
				const token = await user.getIdToken();
				setCurrentUser(user);
				nookies.destroy(null, "token");
				nookies.set(undefined, "token", token, { path: "/" });
			}
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
