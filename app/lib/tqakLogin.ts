import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithCustomToken } from "firebase/auth";
import { auth } from "./firebase";

// tqak accounts live in the same Firebase project as AccuratKey. These values are public by design.
const tqCfg = {
  apiKey: "AIzaSyDRVjdj7VbgOQLdHIM_zUKhkLEunX_dZNM",
  authDomain: "accuratkey.firebaseapp.com",
  projectId: "accuratkey",
  appId: "1:1078720684864:web:ba923d63db84ba977d90a5",
};

export async function signInWithTqak(): Promise<void> {
  const tq = getApps().find(a => a.name === "tqak") ?? initializeApp(tqCfg, "tqak");
  const tqAuth = getAuth(tq);
  const res = await signInWithPopup(tqAuth, new GoogleAuthProvider());
  const idToken = await res.user.getIdToken();
  await signOut(tqAuth); // keep no second session on this site
  const r = await fetch("/api/tqak-login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "tqak sign-in failed");
  await signInWithCustomToken(auth, j.customToken);
}
