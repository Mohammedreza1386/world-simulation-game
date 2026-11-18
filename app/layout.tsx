import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Simulation Game",
  description: "Build nations, shape history, and simulate a living world."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
