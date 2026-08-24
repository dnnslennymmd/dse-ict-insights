import type { Metadata } from "next";
import "./globals.css";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "DSE ICT Insights",
  description:
    "ICT-style market structure analysis for Dar es Salaam Stock Exchange",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </main>
        <DisclaimerFooter />
      </body>
    </html>
  );
}
