"use client";
export const dynamic = "force-dynamic";
import "./globals.css";
import { useEffect } from "react";

let _translateInterval: ReturnType<typeof setInterval> | null = null;

function TranslateInit() {
  useEffect(() => {
    function doTranslate() {
      const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
      if (!match) return;
      const lang = decodeURIComponent(match[1]);
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (select && select.value !== lang) {
        select.value = lang;
        select.dispatchEvent(new Event("change"));
      }
    }

    if (!document.getElementById("google_translate_element")) {
      const el = document.createElement("div");
      el.id = "google_translate_element";
      el.style.cssText = "position:fixed;bottom:-9999px;left:-9999px;visibility:hidden;";
      document.body.appendChild(el);
    }
    if (!(window as any).google?.translate?.TranslateElement) {
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element"
        );
      };
      if (!document.querySelector("script[src*=\"translate.google.com\"]")) {
        const s = document.createElement("script");
        s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(s);
      }
    }

    if (_translateInterval) clearInterval(_translateInterval);
    _translateInterval = setInterval(doTranslate, 600);
    return () => { if (_translateInterval) clearInterval(_translateInterval); };
  }, []);
  return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><title>TrivQuic</title></head>
      <body>
        <TranslateInit />
        {children}
      </body>
    </html>
  );
}

