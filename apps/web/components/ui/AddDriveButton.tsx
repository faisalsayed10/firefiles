import { useRouter } from "next/router";
import "node_modules/video-react/dist/video-react.css";
import React from "react";
import { Plus } from "tabler-icons-react";

const AddDriveButton = () => {
	const router = useRouter();

	return (
		<div
			className="flex flex-col items-center justify-center w-full h-36 ease-in-out duration-100 transition-all cursor-pointer hoverAnim text-[#2D3748] border rounded-lg shadow-md"
			onClick={() => router.push("/new")}
		>
			<Plus size={72} strokeWidth="1px" />
		</div>
	);
};

export default AddDriveButton;
