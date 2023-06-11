import { Dialog, Transition } from "@headlessui/react";
import useBucket from "@hooks/useBucket";
import { DriveFolder } from "@util/types";
import React, { Fragment, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FolderPlus } from "tabler-icons-react";

interface Props {
	currentFolder: DriveFolder;
}

const AddFolderButton: React.FC<Props> = ({ currentFolder }) => {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const cancelButtonRef = useRef(null);
	const inputRef = useRef<HTMLInputElement>();
	const { addFolder } = useBucket();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		if (/[#\$\[\]\*/]/.test(name)) {
			toast.error("Folder name cannot contain special characters.");
			setLoading(false);
			return;
		}

		if (currentFolder === null) return;

		addFolder(name);
		toast.success("Folder Created Successfully.");

		setName("");
		setLoading(false);
		setOpen(false);
	};

	return (
		<>
			<div
				className="hoverAnim h-[140px] border rounded-lg shadow-lg flex flex-col items-center justify-center transition-all ease-in-out duration-100 cursor-pointer text-[#2D3748] w-[140px]"
				onClick={() => setOpen(true)}
			>
				<FolderPlus size={72} strokeWidth="1px" />
			</div>
			<Transition.Root show={open} as={Fragment}>
				<Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
					</Transition.Child>

					<div className="fixed inset-0 z-10 overflow-y-auto">
						<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
								enterTo="opacity-100 translate-y-0 sm:scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 translate-y-0 sm:scale-100"
								leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							>
								<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
									<Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
										Create A Folder
									</Dialog.Title>

									<form onSubmit={handleSubmit}>
										<input
											ref={inputRef}
											type="text"
											required
											placeholder="Folder Name"
											value={name}
											onChange={(e) => setName(e.target.value)}
										/>
									</form>

									<div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
										<button
											type="button"
											className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
											onClick={() => setOpen(false)}
										>
											Close
										</button>
										<button
											type="submit"
											className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
											onClick={() => setOpen(false)}
											ref={cancelButtonRef}
											disabled={loading}
										>
											Submit
										</button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition.Root>
		</>
	);
};

export default AddFolderButton;
