import useBucket from "@hooks/useBucket";
import { UploadingFile } from "@util/types";
import toast from "react-hot-toast";
import { PlayerPause, PlayerPlay, X } from "tabler-icons-react";

type Props = {
	file: UploadingFile;
};

const UploadProgress: React.FC<Props> = ({ file }) => {
	const { setUploadingFiles } = useBucket();

	return (
		<div className="items-center">
			<div className="my-4 flex-1">
				<p className="text-md">{`Uploading ${file.name} (${file.progress}%)`}</p>
				{/* <Progress
					hasStripe
					isAnimated={file.state === "running"}
					value={file.progress}
					height="5px"
				/> */}
			</div>
			<button
				onClick={() => {
					file.state === "running"
						? file.task.pause(file.key, { force: true })
						: file.task.resume(file.key);
				}}
				disabled={file.state === "error"}
				aria-label="pause"
			>
				{file.state === "running" ? <PlayerPause /> : <PlayerPlay />}
			</button>
			<button
				onClick={() => {
					file.task.cancel(file.key);
					setUploadingFiles((prev) => prev.filter((f) => f.id !== file.id));
					toast.error("File upload cancelled.");
				}}
				aria-label="cancel"
			>
				<X />
			</button>
		</div>
	);
};

export default UploadProgress;
