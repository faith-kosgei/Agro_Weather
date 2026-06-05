import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agro-Weather | Farm Intelligence Dashboard",
  description: "Real-time weather intelligence for farms, powered by WeatherAI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
