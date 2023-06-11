/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",

		// Or if using `src` directory:
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			spacing: {
				"2px": "2px",
				"3px": "3px",
				"4px": "4px",
				"5px": "5px",
				"6px": "6px",
				"7px": "7px",
				"8px": "8px",
				"9px": "9px",
				"10px": "10px",
				"11px": "11px",
				"12px": "12px",
				"14px": "14px",
				"15px": "15px",
				"16px": "16px",
				17: "17px",
				"20px": "20px",
				"24px": "24px",
				"26px": "26px",
				"28px": "28px",
				"30px": "30px",
				"32px": "32px",
				"34px": "34px",
				"36px": "36px",
				"40px": "40px",
				"44px": "44px",
				"48px": "48px",
				"52px": "52px",
				"54px": "54px",
				"56px": "56px",
			},
			fontFamily: {
				sans: ["var(--gt-walsheim-font)"],
				mono: ["var(--space-mono-font)"],
				inter: ["var(--inter)"],
			},
			keyframes: {
				blink: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.5" },
				},
				"accordion-down": {
					from: { height: 0 },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: 0 },
				},
				"dismiss-right": {
					from: { transform: "translateX(0)", opacity: 1 },
					to: { transform: "translateX(100%)", opacity: 0 },
				},
				"progress-bar": {
					from: { backgroundSize: "0% 100%" },
					to: { backgroundSize: "90% 100%" },
				},
			},
			animation: {
				blink: "blink 0.5s ease-in",
				"infinite-blink": "blink 2s ease-in infinite",
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				dropdown: "dropdown 0.1s ease-out",
				"dismiss-right": "dismiss-right 0.2s ease-out, accordion-up 0.1s ease-out",
				"progress-bar": "progress-bar 5000ms ease-out forwards",
			},
			backgroundImage: {
				"gradient-180": "linear-gradient(180deg, var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [require("@tailwindcss/forms"), require("tailwindcss-animate")],
};
