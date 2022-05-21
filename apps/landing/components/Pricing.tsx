import { useState } from "react";
import PricingCard from "./PricingCard";

const Pricing = () => {
	const [isMonthly, setIsMonthly] = useState(true);

	return (
		<section className="mt-20 relative z-20 overflow-hidden" id="pricing">
			<div className="m-auto">
				<div className="flex flex-wrap">
					<div className="w-full px-4">
						<div className="text-center mx-auto max-w-[510px]">
							<span className="font-semibold text-lg text-primary mb-2 block">Pricing</span>
							<h2 className="font-bold text-3xl sm:text-4xl md:text-[40px] text-dark mb-4">
								Our Pricing Plan
							</h2>
							<p className="text-base text-body-color">
								Simple affordable pricing. No hidden costs. Cancel anytime.
							</p>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-center gap-4 my-5">
					<p>Monthly</p>
					<input
						type="checkbox"
						className="toggle toggle-lg"
						checked={!isMonthly}
						onChange={() => setIsMonthly((prev) => !prev)}
					/>
					<p>Yearly</p>
				</div>
				<div className="flex flex-wrap justify-center mx-5">
					<PricingCard
						title="Basic"
						price="Free"
						monthly={isMonthly}
						features={["2 drives", "3 providers", "Limited features", "Free updates"]}
						subtitle="Perfect for exploring our product and how it works."
					/>
					<PricingCard
						title="Premium"
						price={isMonthly ? "$10" : "$100"}
						monthly={isMonthly}
						features={[
							"Unlimited drives",
							"Unlimited providers",
							"Invite upto 3 users",
							"All features",
							"Free updates",
						]}
						subtitle="Perfect for users having a lot of drives to manage."
					/>
					<PricingCard
						title="Team"
						price={isMonthly ? "$20" : "$200"}
						monthly={isMonthly}
						features={[
							"Unlimited drives",
							"Unlimited providers",
							"Invite upto 10 users (+$2 from then on)",
							"All features",
							"Free updates",
						]}
						subtitle="Perfect for teams wanting to share their buckets."
					/>
				</div>
				<div className="divider before:bg-gray-800 after:bg-gray-800 max-w-lg mx-auto px-4">OR</div>
				<div className="flex justify-center">
					<div className="bg-gray-900 rounded-xl p-5 mx-4 sm:p-10 max-w-3xl">
						<div className="badge badge-lg badge-outline">Self Host</div>
						<div className="flex items-center justify-between flex-col sm:flex-row">
							<h4 className="mt-4 max-w-xl">
								Set up and manage your own Firefiles instance. Get access to all the features. Free
								forever. No limits.
							</h4>
							<button className="btn mt-4 ml-4">Host your own instance</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Pricing;
