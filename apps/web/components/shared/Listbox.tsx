import React, { Fragment } from "react";
import { Listbox as ListboxComponent, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

type Props = {
	value: string;
	onChange: (value: string) => void;
	label: string;
	options: { label: string; value: string }[];
};

const classNames = (...classes) => classes.filter(Boolean).join(" ");

const Listbox: React.FC<Props> = ({ value, onChange, label, options }) => {
	return (
		<ListboxComponent value={value} onChange={onChange}>
			{({ open }) => (
				<>
					<div className="relative mt-2">
						<ListboxComponent.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
							<span className="block truncate">{label}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
							</span>
						</ListboxComponent.Button>

						<Transition
							show={open}
							as={Fragment}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<ListboxComponent.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
								<ListboxComponent.Option
									className={({ active }) =>
										classNames(
											active ? "bg-indigo-600 text-white" : "text-gray-900",
											"relative cursor-default select-none py-2 pl-8 pr-4"
										)
									}
									value=""
								>
									{({ selected, active }) => (
										<>
											<span
												className={classNames(
													selected ? "font-semibold" : "font-normal",
													"block truncate"
												)}
											>
												None
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
								</ListboxComponent.Option>
								{options.map((option, i) => (
									<ListboxComponent.Option
										key={i}
										className={({ active }) =>
											classNames(
												active ? "bg-indigo-600 text-white" : "text-gray-900",
												"relative cursor-default select-none py-2 pl-8 pr-4"
											)
										}
										value={option.value}
									>
										{({ selected, active }) => (
											<>
												<span
													className={classNames(
														selected ? "font-semibold" : "font-normal",
														"block truncate"
													)}
												>
													{option.label}
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
									</ListboxComponent.Option>
								))}
							</ListboxComponent.Options>
						</Transition>
					</div>
				</>
			)}
		</ListboxComponent>
	);
};

export default Listbox;
