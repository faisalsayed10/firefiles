import axios from "axios";
import Router from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

export default function useUser({ redirectTo = "", redirectIfFound = false } = {}) {
	const { data: user, mutate: mutateUser } = useSWR<{ email: string }>("/api/user", (url) =>
		axios.get(url).then((res) => res.data)
	);

	useEffect(() => {
		if (!redirectTo || !user) return;

		if (
			(redirectTo && !redirectIfFound && !user?.email) ||
			(redirectIfFound && user?.email)
		) {
			Router.push(redirectTo);
		}
	}, [user, redirectIfFound, redirectTo]);

	return { user, mutateUser };
}
