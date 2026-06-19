"use client";
export const dynamic = "force-dynamic";
import "./globals.css";
import { useEffect } from "react";

let _translateInterval: ReturnType<typeof setInterval> | null = null;

function TranslateInit() {
  useEffect(() => {
    // Don't load any third-party script (Google Translate included) until the
    // age gate has been answered with a confirmed 13-plus birth year. This
    // avoids any third-party script execution during restricted sessions.
    // sessionStorage writes in the same tab don't fire "storage" events, so
    // poll briefly until the gate is answered, then load once and stop.
    let cancelled = false;
    function checkAllowed(): boolean {
      try {
        if (new URLSearchParams(window.location.search).get("embed") === "1") return false;
        const stored = sessionStorage.getItem("tq_age_gate_year");
        if (!stored) return false;
        const y = parseInt(stored, 10);
        const age = new Date().getFullYear() - y;
        return !Number.isNaN(age) && age >= 13;
      } catch { return false; }
    }

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

    function initWidget() {
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
    }

    // Poll for the age gate being answered (same-tab sessionStorage writes
    // don't fire "storage" events). Once confirmed 13+, load the widget once
    // and stop polling. Never loads at all for restricted sessions.
    let loaded = false;
    const gateCheck = setInterval(() => {
      if (cancelled || loaded) return;
      if (checkAllowed()) {
        loaded = true;
        initWidget();
        clearInterval(gateCheck);
      }
    }, 500);
    if (checkAllowed()) { loaded = true; initWidget(); clearInterval(gateCheck); }

    return () => {
      cancelled = true;
      clearInterval(gateCheck);
      if (_translateInterval) clearInterval(_translateInterval);
    };
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

