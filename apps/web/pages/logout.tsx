import { useRouter } from "next/router";
import { useEffect } from "react";

const logout = () => {
	const router = useRouter();

	useEffect(() => {
		fetch("/api/auth/logout").then((res) => {
			if (res.ok) router.push("/");
		});
	}, []);

	return <p>Logging you out...</p>;
};

export default logout;
