// auth.config.ts
const config = {
	providers: [
		{
			// Match your Convex deployment URL
			domain: process.env.NEXT_PUBLIC_CONVEX_URL!,
			applicationID: "convex",
		},
	],
};

export default config;
