import type React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WalletInit } from "@/components/wallet/wallet-init";

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex flex-col">
			<WalletInit />
			<Navbar />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
