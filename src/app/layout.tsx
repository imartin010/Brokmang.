import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const geometosNeue = localFont({
  src: "../fonts/Geometos.ttf",
  variable: "--font-geometos-neue",
  fallback: ["system-ui", "Arial", "sans-serif"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "brokmang.",
  description: "Brokerage performance management platform for agents, leaders, and executives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geometosNeue.variable} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
