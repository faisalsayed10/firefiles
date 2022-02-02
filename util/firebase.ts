import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getAnalytics, logEvent, Analytics, isSupported } from "@firebase/analytics";

const app = initializeApp({
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

export const firestore = getFirestore(app);
export const auth = getAuth(app);

let analytics: Analytics;

if (isSupported() && typeof window !== "undefined") {
	analytics = getAnalytics(app);
}

export const sendEvent = (event: string, properties: object) => {
	if (analytics) {
		logEvent(analytics, event, properties);
	}
};

export default app;
