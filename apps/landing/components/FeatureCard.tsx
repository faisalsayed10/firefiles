import { AnimationControls, motion, Variants } from "framer-motion";

interface Props {
	title: string;
	subtitle: string;
	icon: React.ReactElement;
	controls: AnimationControls;
	variants: Variants;
}

const FeatureCard: React.FC<Props> = ({ title, subtitle, icon, controls, variants }) => {
	return (
		<motion.div
			animate={controls}
			initial="hidden"
			variants={variants}
			className="text-left p-8 rounded-md h-52"
			style={{
				background: "radial-gradient(circle at top, rgba(41,41,46,1) 0%, rgba(25,25,28,1) 100%)",
				boxShadow: "0px 11.4128px 35.1163px rgba(0, 0, 0, 0.3)",
			}}
		>
			<div className="text-[#4c3cfe] font-bold text-xl mb-4">{icon}</div>
			<div>
				<p className="pb-2">
					<strong>{title}</strong>
				</p>
				<p className="text-gray-500">{subtitle}</p>
			</div>
		</motion.div>
	);
};

export default FeatureCard;
