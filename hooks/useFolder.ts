import { useToast } from "@chakra-ui/toast";
import { storage } from "@util/firebase";
import { list, ref, StorageReference } from "firebase/storage";
import { useEffect, useReducer } from "react";
import useUser from "./useUser";

export const ROOT_FOLDER: StorageReference = {
	name: "",
	fullPath: "",
	parent: null,
	root: null,
	bucket: null,
	storage: null
};

export enum ACTIONS {
	SELECT_FOLDER = "select-folder",
	UPDATE_FOLDER = "update-folder",
	ADD_FOLDER = "add-folder",
	ADD_FILE = "add-file",
	REMOVE_FILE = "remove-file",
	SET_CHILD_FOLDERS = "set-child-folders",
	SET_CHILD_FILES = "set-child-files",
	SET_LOADING = "set-loading",
	STOP_LOADING = "stop-loading",
	FOLDERS_LOADING = "folders-loading",
	STOP_FOLDERS_LOADING = "stop-folders-loading"
}

export type ReducerState = {
	fullPath?: string;
	folder?: StorageReference;
	childFolders?: StorageReference[];
	childFiles?: StorageReference[];
	loading?: boolean;
	foldersLoading?: boolean;
};

export type ReducerAction = {
	type: ACTIONS;
	payload: ReducerState;
};

const reducer = (state: ReducerState, action: ReducerAction) => {
	switch (action.type) {
		case ACTIONS.SELECT_FOLDER:
			return {
				fullPath: action.payload.fullPath,
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
		case ACTIONS.ADD_FOLDER:
			return {
				...state,
				childFolders: [...state.childFolders, ...action.payload.childFolders]
			};
		case ACTIONS.ADD_FILE:
			return {
				...state,
				childFiles: [...state.childFiles, ...action.payload.childFiles]
			};
		case ACTIONS.REMOVE_FILE:
			return {
				...state,
				childFiles: state.childFiles.filter(
					(file) => file.fullPath !== action.payload.childFiles[0].fullPath
				)
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

export default (fullPath: string = "") => {
	const { currentUser } = useUser();
	const [state, dispatch] = useReducer(reducer, {
		fullPath,
		folder: null,
		childFolders: [],
		childFiles: [],
		loading: false,
		foldersLoading: false
	});

	// set current folder
	useEffect(() => {
		if (!currentUser) return;
		dispatch({ type: ACTIONS.SELECT_FOLDER, payload: { fullPath } });
		if (fullPath === "" || !fullPath) {
			dispatch({
				type: ACTIONS.UPDATE_FOLDER,
				payload: { folder: ROOT_FOLDER }
			});
			return;
		}

		dispatch({ type: ACTIONS.FOLDERS_LOADING, payload: null });
		dispatch({
			type: ACTIONS.UPDATE_FOLDER,
			payload: { folder: ref(storage, fullPath) }
		});
		dispatch({ type: ACTIONS.STOP_FOLDERS_LOADING, payload: null });
	}, [fullPath, currentUser]);

	// get child folders
	useEffect(() => {
		if (!currentUser) return;
		dispatch({ type: ACTIONS.FOLDERS_LOADING, payload: null });
		dispatch({ type: ACTIONS.SET_LOADING, payload: null });

		(async () => {
			try {
				const reference = ref(storage, fullPath);
				let results = await list(reference, { maxResults: 100 });

				dispatch({
					type: ACTIONS.SET_CHILD_FILES,
					payload: { childFiles: results.items }
				});

				while (results.nextPageToken) {
					const more = await list(reference, {
						maxResults: 100,
						pageToken: results.nextPageToken
					});

					results = {
						nextPageToken: more.nextPageToken,
						items: [...results.items, ...more.items],
						prefixes: [...results.prefixes, ...more.prefixes]
					};

					dispatch({
						type: ACTIONS.SET_CHILD_FILES,
						payload: { childFiles: results.items }
					});
				}

				dispatch({ type: ACTIONS.STOP_LOADING, payload: null });

				const localFolders = localStorage.getItem("local-folders");
				const localFoldersArray: StorageReference[] = localFolders ? JSON.parse(localFolders) : [];
				results.prefixes.push(
					...localFoldersArray.filter((folder) => {
						const parentPath = folder.fullPath.split("/").slice(0, -1).join("/");
						return (
							parentPath === fullPath &&
							!results.prefixes.find((prefix) => prefix.name === folder.name)
						);
					})
				);

				dispatch({
					type: ACTIONS.SET_CHILD_FOLDERS,
					payload: { childFolders: results.prefixes.sort() }
				});
			} catch (err) {
				console.error(err);
			}

			dispatch({ type: ACTIONS.STOP_FOLDERS_LOADING, payload: null });
		})();
	}, [fullPath, currentUser]);
	return { ...state, dispatch };
};
