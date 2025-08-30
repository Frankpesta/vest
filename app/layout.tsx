import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-geist",
});

const manrope = Manrope({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-manrope",
});

export const metadata: Metadata = {
	title: "MultiXcapital - Modern Investment Platform",
	description:
		"Invest in crypto, real estate, REITs, and traditional assets with cryptocurrency",
	generator: "MultiXcapital",
	keywords: [
		"investment",
		"crypto",
		"real estate",
		"REITs",
		"DeFi",
		"portfolio",
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geist.variable} ${manrope.variable}`}
			suppressHydrationWarning>
			<body className="min-h-screen bg-background font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange>
					{children}
					<Toaster position="top-right" />
				</ThemeProvider>
			</body>
		</html>
	);
}
