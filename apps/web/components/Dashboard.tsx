import UploadFileButton from "@components/files/UploadFileButton";
import FolderBreadCrumbs from "@components/folders/FolderBreadCrumbs";
import Navbar from "@components/ui/Navbar";
import useBucket from "@hooks/useBucket";
import { useEffect, useMemo, useState } from "react";
import Dropzone from "react-dropzone";
import LoadingOverlay from "react-loading-overlay";
import GridView from "./GridView";
import ListView from "./ListView";
import UploadProgress from "./files/UploadProgress";

const baseStyle = {
	outline: "none",
	transition: "border .2s ease-in-out",
};

const activeStyle = {
	borderWidth: 2,
	borderRadius: 2,
	borderStyle: "dashed",
	borderColor: "#2196f3",
	backgroundColor: "rgba(0, 0, 0, 0.25)",
};

const Dashboard = () => {
	const [draggedFilesToUpload, setDraggedFilesToUpload] = useState<File[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isFolderDeleting, setIsFolderDeleting] = useState(false);
	const { currentFolder, files, folders, loading, uploadingFiles } = useBucket();

	const style = useMemo(() => ({ ...baseStyle, ...(isDragging ? activeStyle : {}) }), [isDragging]);
	const [gridView, setGridView] = useState(false);

	useEffect(() => {
		const storedView = localStorage.getItem("grid_view");
		if (storedView) setGridView(storedView === "true");
	}, []);

	useEffect(() => {
		localStorage.setItem("grid_view", gridView.toString());
	}, [gridView]);

	return (
		<>
			<LoadingOverlay
				active={isFolderDeleting}
				spinner={true}
				text={`Deleting Files... \nPlease DO NOT close this tab.`}
			>
				<Dropzone
					onDrop={(files) => {
						setDraggedFilesToUpload(files);
						setIsDragging(false);
					}}
					noClick
					onDragOver={() => setIsDragging(true)}
					onDragLeave={() => setIsDragging(false)}
				>
					{({ getRootProps, getInputProps }) => (
						<div {...getRootProps({ style })} className="h-full">
							<input {...getInputProps()} />
							<h1
								hidden={!isDragging}
								className="text-2xl text-gray-700 opacity-90 font-bold text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full p-0 m-0"
							>
								DROP FILES ANYWHERE ON THE SCREEN
							</h1>
							<Navbar />
							<FolderBreadCrumbs currentFolder={currentFolder} />
							<hr />
							{!gridView ? (
								<ListView
									loading={loading}
									currentFolder={currentFolder}
									files={files}
									folders={folders}
									setGridView={setGridView}
									setIsFolderDeleting={setIsFolderDeleting}
								/>
							) : (
								<GridView
									loading={loading}
									currentFolder={currentFolder}
									files={files}
									folders={folders}
									setGridView={setGridView}
									setIsFolderDeleting={setIsFolderDeleting}
								/>
							)}
						</div>
					)}
				</Dropzone>
				<UploadFileButton
					filesToUpload={draggedFilesToUpload}
					setFilesToUpload={setDraggedFilesToUpload}
				/>
			</LoadingOverlay>
			{uploadingFiles.length > 0 && (
				<div className="flex items-center justify-center w-full">
					<div className="rounded-sm px-4 fixed bottom-5 min-w-[60vw] w-[80vw] shadow-md bg-gray-700">
						{uploadingFiles.map((uploading) => (
							<UploadProgress key={uploading.id} file={uploading} />
						))}
					</div>
				</div>
			)}
		</>
	);
};

export default Dashboard;
