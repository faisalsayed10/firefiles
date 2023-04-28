import Image from "next/image";
import useInterval from "@hooks/useInterval";
import useUser from "@hooks/useUser";
import axios from "axios";
import Head from "next/head";
import React, { useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "@components/ui/LoadingSpinner";

export default function Login() {
	const { mutateUser } = useUser({ redirectTo: "/", redirectIfFound: true });
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [timeGap, setTimeGap] = useState(0);

	useInterval(() => setTimeGap(timeGap - 1), timeGap > 0 ? 1000 : null);

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
			<div className="auth-background flex flex-col items-center justify-center min-h-screen gap-3">
				<div className="w-full max-w-sm space-y-10">
					<div>
						<Image width={96} height={96} className="mx-auto" src="/logo.png" alt="Firefiles" />
						<h2 className="mt-3 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
							Sign in to your account
						</h2>
					</div>
					<form className="space-y-3" onSubmit={handleSubmit}>
						<div className="relative -space-y-px rounded-md shadow-sm">
							<div className="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-gray-300" />
							<div>
								<label htmlFor="email-address" className="sr-only">
									Email address
								</label>
								<input
									id="email-address"
									name="email"
									type="email"
									autoComplete="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
									placeholder="Email address"
								/>
							</div>
						</div>
						<button
							disabled={!email || timeGap > 0 || loading}
							type="submit"
							className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? <LoadingSpinner /> : "Sign in"}
						</button>
						{timeGap > 0 && (
							<p className="text-sm">Please wait {timeGap} seconds before trying again.</p>
						)}
					</form>
				</div>
			</div>
		</>
	);
}
