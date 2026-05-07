import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DRISHTI · AI-powered postal disaster response",
  description:
    "DRISHTI transforms India's 164,999 post offices into an AI-powered disaster response infrastructure — from 7 days to 2 hours.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
