import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Happy Birthday, Esha 💕",
  description: "A little birthday gift for Esha",
  openGraph: {
    title: "Happy Birthday, Esha 💕",
    description: "A personal birthday wish",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ff2d6a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
