import {
	collection,
	DocumentData, getDocs, limit, orderBy, Query,
	query, writeBatch
} from "firebase/firestore";
import { firestore } from "./firebase";

export const deleteCollection = async (batchSize: number) => {
	const collectionRef = collection(firestore, "delete-these"); // TODO: test this for a temp collection first.
	const q = query(collectionRef, orderBy("name"), limit(batchSize));

	return new Promise((resolve, reject) => {
		deleteQueryBatch(q, resolve).catch(reject);
	});
};

export const deleteQueryBatch = async (q: Query<DocumentData>, resolve: (reason?: any) => void) => {
	const snapshot = await getDocs(q);
	const batchSize = snapshot.size;
	if (batchSize === 0) {
		resolve();
		return;
	}

	const batch = writeBatch(firestore);
	snapshot.docs.forEach((doc) => {
		batch.delete(doc.ref);
	});
	await batch.commit();

	process.nextTick(() => {
		deleteQueryBatch(q, resolve);
	});
};
