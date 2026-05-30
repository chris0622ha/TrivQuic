import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "One-Tap Trivia",
  description: "Lightning-fast trivia. 3 seconds. No mercy.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
