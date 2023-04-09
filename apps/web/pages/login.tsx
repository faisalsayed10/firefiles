import Image from "next/image";
import useInterval from "@hooks/useInterval";
import useUser from "@hooks/useUser";
import axios from "axios";
import Head from "next/head";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
	const { mutateUser } = useUser({ redirectTo: "/", redirectIfFound: true });
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [timeGap, setTimeGap] = useState(0);

	useInterval(
		() => {
			setTimeGap(timeGap - 1);
		},
		timeGap > 0 ? 1000 : null
	);

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		try {
			setLoading(true);
			const { data } = await axios.post("/api/auth/login", { email });

			toast.success(data.message);
			setTimeGap(30);
		} catch (err) {
			toast.error(err.response.data.error || err.message);
		}
		setLoading(false);
	};

	return (
		<>
			<Head>
				<title>Login | Firefiles</title>
			</Head>
			<div className="auth-background flex flex-col items-center justify-center min-h-screen">
				<Image src="/logo.png" width={100} height={100} priority alt="Firefiles logo" />
				<form className="flex items-center flex-col py-4" onSubmit={handleSubmit}>
					<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
						Sign in to your account
					</h2>

					<input
						className="mb=4"
						placeholder="john@example.com"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<button
						className="mb=3 bg-green-400 w-full h-16 rounded-3xl"
						disabled={!email || timeGap > 0}
						type="submit"
					>
						{loading ? <></> : "Log in"}
					</button>
					{timeGap > 0 && (
						<p className="text-sm">Please wait {timeGap} seconds before trying again.</p>
					)}
				</form>
			</div>
		</>
	);
}
