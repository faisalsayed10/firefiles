import { DriveFile } from "@util/types";
import File from "./File";

interface Props {
	files: DriveFile[];
}

const FilesTable: React.FC<Props> = ({ files }) => {
	return (
		<div className="border rounded-lg overflow-x-auto p-4 mx-4 mb-4">
			<table className="w-full">
				<thead>
					<tr>
						<th></th>
						<th>Name</th>
						<th>Size</th>
						<th className="text-center">Share</th>
						<th className="text-center">Download</th>
						<th className="text-center">Delete</th>
					</tr>
				</thead>
				<tbody>
					{files.length > 0 && files.map((file) => <File key={file.name} file={file} />)}
				</tbody>
			</table>
		</div>
	);
};

export default FilesTable;
