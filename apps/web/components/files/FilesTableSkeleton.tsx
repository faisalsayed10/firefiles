import Skeleton from "react-loading-skeleton";

interface Props {
	width?: string;
}

const SkeletonRow: React.FC<Props> = ({ width }) => (
	<tr>
		<td>
			<Skeleton height="5px" width={width} className="my-3" />
		</td>
		<td>
			<Skeleton height="5px" width={width} className="my-3" />
		</td>
		<td>
			<Skeleton height="5px" width={width} className="my-3" />
		</td>
		<td>
			<Skeleton height="5px" width={width} className="my-3" />
		</td>
		<td>
			<Skeleton height="5px" width={width} className="my-3" />
		</td>
	</tr>
);

const FilesTableSkeleton = () => {
	return (
		<div className="border rounded-lg overflow-x-auto mx-4">
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Size</th>
						<th>Share</th>
						<th>Download</th>
						<th>Delete</th>
					</tr>
				</thead>
				<tbody>
					<SkeletonRow width="75px" />
					<SkeletonRow width="125px" />
					<SkeletonRow width="50px" />
					<SkeletonRow width="100px" />
				</tbody>
			</table>
		</div>
	);
};

export default FilesTableSkeleton;
