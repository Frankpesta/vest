export default {
	providers: [
		{
			// Your Convex site URL is provided in a system
			// environment variable
			domain: process.env.CONVEX_SITE_URL,

			// Application ID has to be "convex"
			applicationID: "convex",
		},
		{
			domain: "https://accounts.google.com",
			applicationID: process.env.GOOGLE_CLIENT_ID!,
		  },
	],
};
