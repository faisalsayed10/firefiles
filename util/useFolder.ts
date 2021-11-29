import { database, firestore } from "@util/firebase";
import {
	collection, doc,
	getDoc, onSnapshot, orderBy, query, where
} from "firebase/firestore";
import { useEffect, useReducer } from "react";
import { FileCollection, FolderCollection } from "./types";

export const ROOT_FOLDER: FolderCollection = { name: "Root", id: null, path: [] };

enum ACTIONS {
	SELECT_FOLDER = "select-folder",
	UPDATE_FOLDER = "update-folder",
	SET_CHILD_FOLDERS = "set-child-folders",
	SET_CHILD_FILES = "set-child-files",
	SET_LOADING = "set-loading",
	STOP_LOADING = "stop-loading",
	FOLDERS_LOADING = "folders-loading",
	STOP_FOLDERS_LOADING = "stop-folders-loading"
}

type ReducerState = {
	folderId?: string;
	folder?: FolderCollection;
	childFolders?: FolderCollection[];
	childFiles?: FileCollection[];
	loading?: boolean;
	foldersLoading?: boolean;
};

type ReducerAction = {
	type: ACTIONS;
	payload: ReducerState;
};

const reducer = (state: ReducerState, action: ReducerAction) => {
	switch (action.type) {
		case ACTIONS.SELECT_FOLDER:
			return {
				folderId: action.payload.folderId,
				folder: action.payload.folder,
				childFiles: [],
				childFolders: []
			};
		case ACTIONS.UPDATE_FOLDER:
			return {
				...state,
				folder: action.payload.folder
			};
		case ACTIONS.SET_CHILD_FOLDERS:
			return {
				...state,
				childFolders: action.payload.childFolders
			};
		case ACTIONS.SET_CHILD_FILES:
			return {
				...state,
				childFiles: action.payload.childFiles
			};
		case ACTIONS.SET_LOADING:
			return {
				...state,
				loading: true
			};
		case ACTIONS.STOP_LOADING:
			return {
				...state,
				loading: false
			};
		case ACTIONS.FOLDERS_LOADING:
			return {
				...state,
				foldersLoading: true
			};
		case ACTIONS.STOP_FOLDERS_LOADING:
			return {
				...state,
				foldersLoading: false
			};
		default:
			return state;
	}
};

export const useFolder = (folderId: string = "", folder: FolderCollection = null) => {
	const [state, dispatch] = useReducer(reducer, {
		folderId,
		folder,
		childFolders: [],
		childFiles: [],
		loading: false,
		foldersLoading: false
	});

	useEffect(() => {
		dispatch({ type: ACTIONS.SELECT_FOLDER, payload: { folderId, folder } });
	}, [folder, folderId]);

	useEffect(() => {
		if (folderId === "" || !folderId) {
			return dispatch({
				type: ACTIONS.UPDATE_FOLDER,
				payload: { folder: ROOT_FOLDER }
			});
		}
		dispatch({ type: ACTIONS.FOLDERS_LOADING, payload: null });

		(async () => {
			await getDoc(doc(firestore, "folders", folderId))
				.then((doc) => {
					dispatch({
						type: ACTIONS.UPDATE_FOLDER,
						payload: { folder: database.formatDoc(doc) }
					});
					dispatch({ type: ACTIONS.STOP_FOLDERS_LOADING, payload: null });
				})
				.catch(() => {
					dispatch({
						type: ACTIONS.UPDATE_FOLDER,
						payload: { folder: ROOT_FOLDER }
					});
					dispatch({ type: ACTIONS.STOP_FOLDERS_LOADING, payload: null });
				});
		})();
	}, [folderId]);

	useEffect(() => {
		dispatch({ type: ACTIONS.FOLDERS_LOADING, payload: null });
		onSnapshot(
			query(
				collection(firestore, "folders"),
				where("parentId", "==", folderId || null),
				orderBy("createdAt")
			),
			(snapshot) => {
				dispatch({
					type: ACTIONS.SET_CHILD_FOLDERS,
					payload: { childFolders: snapshot.docs.map(database.formatDoc) }
				});
				dispatch({ type: ACTIONS.STOP_FOLDERS_LOADING, payload: null });
			}
		);
	}, [folderId]);

	useEffect(() => {
		dispatch({ type: ACTIONS.SET_LOADING, payload: null });
		onSnapshot(
			query(
				collection(firestore, "files"),
				where("folderId", "==", folderId || null),
				orderBy("createdAt")
			),
			(snapshot) => {
				dispatch({
					type: ACTIONS.SET_CHILD_FILES,
					payload: { childFiles: snapshot.docs.map(database.formatDoc) }
				});
				dispatch({ type: ACTIONS.STOP_LOADING, payload: null });
			}
		);
	}, [folderId]);

	return state;
};
