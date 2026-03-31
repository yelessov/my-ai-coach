import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI DUP Coach",
  description: "Your science-based lifting partner",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI Coach",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <html lang="en">
      <body className="antialiased overflow-x-hidden text-slate-200">
        {children}
      </body>
    </html>
  );
}