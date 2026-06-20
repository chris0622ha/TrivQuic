"use client";
export const dynamic = "force-dynamic";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><title>TrivQuic</title></head>
      <body>
        {children}
      </body>
    </html>
  );
}

