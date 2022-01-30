import admin from "firebase-admin";

if (admin.apps.length === 0) {
	admin.initializeApp({
		credential: admin.credential.cert({
			clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
			privateKey: process.env.FIREBASE_PRIVATE_KEY,
			projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
		})
	});
}

export const auth = admin.auth();
export const firestore = admin.firestore();
