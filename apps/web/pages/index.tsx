import Layout from "@components/Layout";
import OptionsPopover from "@components/popups/OptionsPopover";
import AddDriveButton from "@components/ui/AddDriveButton";
import useUser from "@hooks/useUser";
import { Drive } from "@prisma/client";
import { PROVIDERS } from "@util/globals";
import { deleteDrive } from "@util/helpers";
import { Provider } from "@util/types";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useSWR from "swr";
import { Trash } from "tabler-icons-react";

const Dashboard = () => {
	const router = useRouter();
	const { user } = useUser({ redirectTo: "/login" });
	const { data, isValidating, mutate } = useSWR<Drive[]>(`/api/drive`);

	return (
		<Layout>
			<Head>
				<title>Your Drives | Firefiles</title>
				<meta charSet="utf-8" />
			</Head>
			<div className="flex flex-col flex-1">
				<h1 className="text-3xl font-semibold my-3">Your Drives</h1>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
					{!data && isValidating ? (
						<>
							<Skeleton height="140px" width="100%" borderRadius="lg" />
							<Skeleton height="140px" width="100%" borderRadius="lg" />
							<Skeleton height="140px" width="100%" borderRadius="lg" />
							<Skeleton height="140px" width="100%" borderRadius="lg" />
						</>
					) : (
						data?.map((drive) => (
							<div
								key={drive.id}
								className="hoverAnim cursor-pointer flex-col items-center rounded-lg shadow-lg w-full h-[140px] border transition-all duration-100 ease-in-out"
							>
								<div
									className="flex-1 w-full mt-2"
									onClick={() => router.push(`/drives/${drive.id}`)}
								>
									<Image
										alt="Provider Logo"
										src={PROVIDERS.filter((p) => p.id === drive.type)[0].logo}
										width={90}
										height={90}
										className="m-auto"
									/>
								</div>
								<div className="flex p-2 w-full justify-between items-center">
									<p
										onClick={() => router.push(`/drives/${drive.id}`)}
										className="flex-1 truncate text-sm text-left px-2"
									>
										{drive.name}
									</p>
									<OptionsPopover
										options={[
											{
												name: "Delete Drive",
												icon: <Trash width={16} height={16} />,
												onClick: async (e) => {
													e.stopPropagation();
													await deleteDrive(Provider[drive.type], drive.id);
													mutate(data.filter((b) => b.id !== drive.id));
												},
											},
										]}
									/>
								</div>
							</div>
						))
					)}
					<AddDriveButton />
				</div>
			</div>
		</Layout>
	);
};

export default Dashboard;
