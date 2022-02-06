import { FILE_TYPES } from "@util/globals";
import "file-icon-vectors/dist/file-icon-square-o.min.css";
import { useEffect } from "react";

type Props = {
	id: string;
	extension: string;
};

const FileIcon: React.FC<Props> = ({ extension, id }) => {
	useEffect(() => {
		const icon = document.querySelector(`.icon-${id}`);
		FILE_TYPES.includes(extension)
			? icon.classList.add(`fiv-icon-${extension}`)
			: icon.classList.add("fiv-icon-blank");
	}, []);

	return <span className={`fiv-sqo fiv-size-md icon-${id}`} />;
};

export default FileIcon;
