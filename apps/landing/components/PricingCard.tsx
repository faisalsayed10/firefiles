import { Check } from "tabler-icons-react";

type Props = {
	title: string;
	price: string;
	subtitle: string;
	features: string[];
	monthly: boolean;
};

const PricingCard: React.FC<Props> = ({ title, price, subtitle, features, monthly }) => {
	return (
		<div className="border border-slate-800 rounded-xl max-w-xs m-2 shadow-lg">
			<div className="p-6">
				<h1 className="font-semibold text-lg mb-4">{title}</h1>
				<p className="text-base text-gray-400 pb-8 max-w-[90%]">{subtitle}</p>
				<div className="mb-8">
					<h1 className="font-bold text-dark text-4xl inline">{price} </h1>
					<p className="inline text-gray-400 font-semibold">/{monthly ? "mo" : "yr"}</p>
				</div>
				<button className="block btn w-full">Get Started</button>
			</div>
			<hr className="w-full border-slate-800" />
			<div className="p-6">
				<h1 className="mb-5 text-sm uppercase">What's Included</h1>
				{features.map((feature, i) => (
					<div className="mb-2" key={i}>
						<Check className="inline mr-4 text-purple-600" />
						<p key={i} className="text-gray-400 mb-2 inline">
							{feature}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default PricingCard;
