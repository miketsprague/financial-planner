import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Financial Planner",
  description:
    "US–UK cross-border personal financial planning with Monte Carlo simulation, inflation adjustment, and account-wrapper insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
