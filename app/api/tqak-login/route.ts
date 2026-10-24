import { NextResponse } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Exchanges a tqak (accuratkey Firebase project) ID token for a TrivQuic sign-in.
// The tqak token is verified against Google's public keys; the account record is read
// with the user's own token, so child-use accounts are refused here.
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const TQ = "accuratkey";

export async function POST(req: Request) {
  const email = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!email || !key) return NextResponse.json({ error: "tqak sign-in isn't set up yet." }, { status: 503 });
  let idToken = "";
  try { idToken = (await req.json()).idToken || ""; } catch {}
  if (!idToken) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  let uid = "";
  try {
    const { payload } = await jwtVerify(idToken, JWKS, { issuer: `https://securetoken.google.com/${TQ}`, audience: TQ });
    uid = String(payload.sub || "");
  } catch { return NextResponse.json({ error: "Invalid tqak sign-in." }, { status: 401 }); }
  if (!uid) return NextResponse.json({ error: "Invalid tqak sign-in." }, { status: 401 });

  // Read the account record as the user (their own token passes the Firestore rules).
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${TQ}/databases/(default)/documents/accounts/${uid}`, { headers: { Authorization: `Bearer ${idToken}` } });
  if (r.status === 404) return NextResponse.json({ error: "No tqak account yet. Create one at tqak.vercel.app first." }, { status: 403 });
  if (!r.ok) return NextResponse.json({ error: "Couldn't check your tqak account." }, { status: 502 });
  const doc = await r.json();
  if (doc?.fields?.childUse?.booleanValue === true) return NextResponse.json({ error: "Child accounts can't sign in to TrivQuic." }, { status: 403 });

  if (!getApps().length) initializeApp({ credential: cert({ projectId: "onetap-trivia", clientEmail: email, privateKey: key.replace(/\\n/g, "\n") }) });
  const customToken = await getAuth().createCustomToken(`tqak_${uid}`, { tqak: true });
  return NextResponse.json({ customToken });
}
