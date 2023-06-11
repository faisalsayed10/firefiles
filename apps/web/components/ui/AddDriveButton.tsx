import { Dialog, DialogContent, DialogTrigger } from "@components/shared/Dialog";
import { PROVIDERS } from "@util/globals";
import Image from "next/image";
import { useRouter } from "next/router";
import "node_modules/video-react/dist/video-react.css";
import { useState } from "react";
import { Plus } from "tabler-icons-react";

const AddDriveButton = () => {
	const [open, setOpen] = useState(false);
	const onOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	const router = useRouter();

	return (
		<Dialog open={open} modal>
			<DialogTrigger onClick={onOpen}>
				<div className="flex flex-col items-center justify-center w-full h-36 ease-in-out duration-100 transition-all cursor-pointer hoverAnim text-[#2D3748] border rounded-lg shadow-md">
					<Plus size={72} strokeWidth="1px" />
				</div>
			</DialogTrigger>

			<DialogContent
				onInteractOutside={handleClose}
				className="w-[512px]"
				style={{ boxShadow: "2px 2px 30px 10px rgba(0, 0, 0, 0.2)" }}
			>
				<div className="grid grid-cols-3 gap-4 w-full h-full">
					{PROVIDERS.map((p) => (
						<div
							key={p.id}
							className="hoverAnim flex relative cursor-pointer items-center flex-col transition-all ease-in-out duration-100"
							onClick={() => {
								if (p.isComingSoon) return;
								router.push(`/new/${p.id}`);
							}}
						>
							<Image
								width={60}
								height={70}
								src={p.logo}
								alt="Provider logo"
								className="max-h-[70px]"
							/>
							<p className="align-center mt-2">{p.name}</p>
							{p.isComingSoon ? (
								<div className="rounded-full bg-purple-500 px-2 py-1 text-xs">COMING SOON</div>
							) : null}
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AddDriveButton;
