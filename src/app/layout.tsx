import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ambrosia • Bakery Operations",
  description: "Next-gen real-time bakery order fulfillment and dispatch platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#F5F5F7] text-[#1D1D1F] antialiased">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-full flex flex-col selection:bg-blue-500 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
