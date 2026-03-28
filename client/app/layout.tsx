import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PWAProvider } from "../components/pwa-provider";
import CookieConsent from "@/components/cookie-consent";
import Link from "next/link";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SYNCRO — Subscription Manager",
    description: "Self-custodial subscription management on Stellar",
    generator: "v0.app",
    manifest: "/manifest.json",
    themeColor: "#6366f1",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`font-sans antialiased`} suppressHydrationWarning>
                <PWAProvider>
                    {children}
                </PWAProvider>
                <footer className="py-4 text-center text-xs text-gray-500">
                    <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                    <span className="mx-2">·</span>
                    <Link href="/terms" className="hover:underline">Terms of Service</Link>
                </footer>
                <CookieConsent />
            </body>
        </html>
    );
}
