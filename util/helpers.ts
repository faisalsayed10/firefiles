import axios from "axios";
import { deleteApp, getApps } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { BucketFile, BucketType } from "./types";

export const deleteBucket = async (type: BucketType, token: string, id: string) => {
	if (window.confirm("Are you sure you want to delete this bucket?")) {
		await axios.delete(`/api/bucket?id=${id}`, {
			headers: { token },
		});

		switch (type) {
			case BucketType.firebase:
				const has_logged_in =
					window.localStorage.getItem(`has_logged_in_${id}`) === "true" || false;

				const has_initialized = getApps().filter((app) => app.name === id)[0];

				if (has_logged_in && has_initialized) {
					await signOut(getAuth(has_initialized));
					deleteApp(has_initialized);
					window.localStorage.removeItem(`has_logged_in_${id}`);
					window.localStorage.removeItem(`local_folders_${id}`);
					break;
				}
			default:
				break;
		}
	}
};

export const onLogout = async () => {
	const apps = getApps().filter((app) => app.name !== "[DEFAULT]");
	apps.forEach(async (app) => {
		await signOut(getAuth(app));
		deleteApp(app);
		window.localStorage.removeItem(`has_logged_in_${app.name}`);
		window.localStorage.removeItem(`local_folders_${app.name}`);
	});
};

export const download = async (file: BucketFile) => {
	try {
		toast.loading("Starting download...", { duration: 3000 });
		if (parseInt(file.size) > 10000000) return window.open(file.url, "_blank");

		const response = await axios.get(file.url, { responseType: "blob" });
		const url = window.URL.createObjectURL(new Blob([response.data]));
		const a = document.createElement("a");
		a.href = url;
		a.download = file.name;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		}, 0);
	} catch (err) {
		window.open(file.url, "_blank");
	}
};
