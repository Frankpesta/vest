import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import type React from "react";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Navbar />
			<div className="min-h-screen flex items-center justify-center bg-muted/50">
				<div className="w-full max-w-md p-6">{children}</div>
			</div>
			<Footer />
		</>
	);
}
