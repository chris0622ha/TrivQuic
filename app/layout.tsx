"use client";
export const dynamic = "force-dynamic";
import "@fontsource/bricolage-grotesque/latin-600.css";
import "@fontsource/bricolage-grotesque/latin-800.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-700.css";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>TrivQuic</title>
        <meta name="theme-color" content="#130a24" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

