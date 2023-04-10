import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";

const regions = [
	{ name: "US East (Ohio)", code: "us-east-2" },
	{ name: "US East (N. Virginia)", code: "us-east-1" },
	{ name: "US West (N. California)", code: "us-west-1" },
	{ name: "US West (Oregon)", code: "us-west-2" },
	{ name: "Africa (Cape Town)", code: "af-south-1" },
	{ name: "Asia Pacific (Hong Kong)", code: "ap-east-1" },
	{ name: "Asia Pacific (Jakarta)", code: "ap-southeast-3" },
	{ name: "Asia Pacific (Mumbai)", code: "ap-south-1" },
	{ name: "Asia Pacific (Osaka)", code: "ap-northeast-3" },
	{ name: "Asia Pacific (Seoul)", code: "ap-northeast-2" },
	{ name: "Asia Pacific (Singapore)", code: "ap-southeast-1" },
	{ name: "Asia Pacific (Sydney)", code: "ap-southeast-2" },
	{ name: "Asia Pacific (Tokyo)", code: "ap-northeast-1" },
	{ name: "Canada (Central)", code: "ca-central-1" },
	{ name: "China (Beijing)", code: "cn-north-1" },
	{ name: "China (Ningxia)", code: "cn-northwest-1" },
	{ name: "Europe (Frankfurt)", code: "eu-central-1" },
	{ name: "Europe (Ireland)", code: "eu-west-1" },
	{ name: "Europe (London)", code: "eu-west-2" },
	{ name: "Europe (Milan)", code: "eu-south-1" },
	{ name: "Europe (Paris)", code: "eu-west-3" },
	{ name: "Europe (Stockholm)", code: "eu-north-1" },
	{ name: "Middle East (Bahrain)", code: "me-south-1" },
	{ name: "South America (São Paulo)", code: "sa-east-1" },
];

type Props = {
	value: string;
	onChange: (value) => void;
};

function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

const AWSRegionSelect: React.FC<Props> = ({ value, onChange }) => {
	return (
		<Listbox value={value} onChange={onChange}>
			{({ open }) => (
				<>
					<Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
						Region
					</Listbox.Label>
					<div className="relative mt-2">
						<Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
							<span className="block truncate">{regions.find((r) => r.code === value)?.name}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							</span>
						</Listbox.Button>

						<Transition
							show={open}
							as={Fragment}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
								{regions.map((region) => (
									<Listbox.Option
										key={region.code}
										className={({ active }) =>
											classNames(
												active ? "bg-indigo-600 text-white" : "text-gray-900",
												"relative cursor-default select-none py-2 pl-8 pr-4"
											)
										}
										value={region.code}
									>
										{({ selected, active }) => (
											<>
												<span
													className={classNames(
														selected ? "font-semibold" : "font-normal",
														"block truncate"
													)}
												>
													{region?.name}
												</span>

												{selected ? (
													<span
														className={classNames(
															active ? "text-white" : "text-indigo-600",
															"absolute inset-y-0 left-0 flex items-center pl-1.5"
														)}
													>
														<CheckIcon className="h-5 w-5" aria-hidden="true" />
													</span>
												) : null}
											</>
										)}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Transition>
					</div>
				</>
			)}
		</Listbox>
	);
};

export default AWSRegionSelect;
