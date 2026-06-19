"use client";
import { useState, useEffect } from "react";

/**
 * Shared under-13 redirect guard for routes that require identity
 * (multiplayer, duels, search, friends). Fail-closed: if the age gate
 * hasn't been answered with a confirmed 13-plus birth year in this
 * session, the visitor is redirected back to "/" rather than letting
 * them reach a screen that creates Firebase data tied to a name.
 * sessionStorage never leaves the browser, so this never collects anything.
 */
export function useBlockUnder13Redirect() {
  const [checked, setChecked] = useState(false);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    let allowed = false;
    try {
      const stored = sessionStorage.getItem("tq_age_gate_year");
      if (stored) {
        const y = parseInt(stored, 10);
        const age = new Date().getFullYear() - y;
        allowed = !Number.isNaN(age) && age >= 13;
      }
    } catch {}
    if (!allowed) {
      setBlocked(true);
      window.location.href = "/";
      return;
    }
    setChecked(true);
  }, []);
  return { checked, blocked };
}

export function AgeGateBlockedScreen() {
  return (
    <div style={{ minHeight:"100vh", background:"#0f0f1a", display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af" }}>
      Redirecting…
    </div>
  );
}
