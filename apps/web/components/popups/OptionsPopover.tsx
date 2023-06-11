import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { DotsVertical } from "tabler-icons-react";

interface Props {
	options: {
		name: string;
		icon: React.ReactNode;
		onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	}[];
}

const OptionsPopover: React.FC<Props> = ({ options }) => {
	return (
		<Popover.Root>
			<Popover.Trigger>
				<DotsVertical />
			</Popover.Trigger>

			<Popover.Portal>
				<Popover.Content
					className="animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md border bg-white py-1.5 text-black shadow-md outline-none"
					sideOffset={5}
					align="start"
				>
					{options.map((option) => (
						<div
							className="cursor-pointer flex items-center justify-center gap-2 bg-white px-2 py-1.5 hover:bg-gray-100 transition-colors duration-100 ease-in-out"
							key={option.name}
							onClick={option.onClick}
						>
							{option.icon}
							{option.name}
						</div>
					))}
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
};

export default OptionsPopover;
