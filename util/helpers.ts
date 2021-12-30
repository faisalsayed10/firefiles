import { AES, enc } from "crypto-js";
import { FirebaseOptions } from "firebase/app";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "./firebase";

export const encrypt = async (data: FirebaseOptions) => {
	try {
		const uid = auth.currentUser.uid;
		const ciphertext = AES.encrypt(JSON.stringify(data), process.env.CIPHER_KEY).toString();
		await setDoc(doc(firestore, "users", uid), { config: ciphertext });
	} catch (err) {
		console.error(err);
	}
};

export const decrypt = async () => {
	const uid = auth.currentUser.uid;
	const result = await getDoc(doc(firestore, "users", uid));
	if (result.exists()) {
		const bytes = AES.decrypt(result.data().config, process.env.CIPHER_KEY).toString(enc.Utf8);
		return JSON.parse(bytes);
	} else {
    return undefined;
	}
};
