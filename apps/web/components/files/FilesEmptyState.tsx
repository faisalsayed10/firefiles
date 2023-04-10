const FilesEmptyState = () => (
	<div className="flex p-8 mx-4 border rounded-lg justify-center items-center flex-col text-center">
		<p className="text-2xl font-normal mb-8">
			There aren't any files
		</p>
		<p className="text-xl font-normal">
			Drop a file anywhere on the screen or click the button on the bottom right to upload a file.
		</p>
	</div>
);

export default FilesEmptyState;
