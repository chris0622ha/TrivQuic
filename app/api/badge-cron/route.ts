import { NextRequest, NextResponse } from "next/server";

const DB = "https://onetap-trivia-default-rtdb.firebaseio.com";
const BADGE_LEVELS = ["none", "star", "bronze", "silver", "gold"];

function getBadgeLevel(badge: string | null): number {
  return BADGE_LEVELS.indexOf(badge || "none");
}
function badgeFromLevel(level: number): string | null {
  return level <= 0 ? null : BADGE_LEVELS[level] || null;
}

// The Firebase Realtime Database legacy secret authenticates server-side
// REST calls without requiring a user session. This is stored in Vercel's
// env vars as FIREBASE_DB_SECRET. The cron previously used unauthenticated
// REST calls which broke when real security rules replaced Test Mode.
function authParam() {
  const secret = process.env.FIREBASE_DB_SECRET;
  return secret ? `?auth=${secret}` : "";
}

async function dbGet(path: string) {
  const res = await fetch(`${DB}/${path}.json${authParam()}`);
  if (!res.ok) {
    console.error(`dbGet failed: ${path} → ${res.status} ${res.statusText}`);
    return null;
  }
  return res.json();
}
async function dbPatch(path: string, data: any) {
  const res = await fetch(`${DB}/${path}.json${authParam()}`, {
    method: "PATCH", body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) console.error(`dbPatch failed: ${path} → ${res.status}`);
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await dbGet("users");
  if (!users) return NextResponse.json({ ok: true, processed: 0 });

  const now = Date.now();
  const oneDay = 86400000;
  const oneWeek = 7 * oneDay;
  let processed = 0;

  for (const [uid, user] of Object.entries(users as Record<string, any>)) {
    try {
      const loyaltyBadges = ["star", "bronze", "silver", "gold"];
      const currentBadge = user.badge || null;
      if (currentBadge && !loyaltyBadges.includes(currentBadge) && currentBadge !== null) continue;

      const history: Record<string, any> = user.loginHistory || {};
      const sessions = Object.values(history).filter((s: any) => s.ts);

      // Unique days logged in during the last 7 days — only sessions >= 10 min count
      const last7 = sessions.filter((s: any) => now - s.ts < oneWeek && (s.durationMin || 0) >= 10);
      const uniqueDays = new Set(last7.map((s: any) => new Date(s.ts).toDateString())).size;

      // Days since last login (for demotion)
      const lastSession = sessions.sort((a: any, b: any) => b.ts - a.ts)[0];
      const daysSince = lastSession ? Math.floor((now - lastSession.ts) / oneDay) : 999;

      const currentLevel = getBadgeLevel(currentBadge);
      let newLevel = currentLevel;

      // Earn
      if (uniqueDays >= 5)      newLevel = 4; // Gold
      else if (uniqueDays >= 4) newLevel = Math.max(newLevel, 3); // Silver
      else if (uniqueDays >= 3) newLevel = Math.max(newLevel, 2); // Bronze
      else if (uniqueDays >= 2) newLevel = Math.max(newLevel, 1); // Star

      // Demote for inactivity
      if (daysSince >= 10 && newLevel > 0) newLevel = newLevel - 1;
      if (daysSince >= 21) newLevel = 0;

      const newBadge = badgeFromLevel(newLevel);
      if (newBadge !== currentBadge) {
        await dbPatch(`users/${uid}`, { badge: newBadge });
        // Sync to leaderboard
        const lb = await dbGet("leaderboard");
        if (lb) {
          const updates: any = {};
          Object.keys(lb).forEach(k => {
            if (k.startsWith(uid + "_") || lb[k]?.uid === uid) updates[`leaderboard/${k}/badge`] = newBadge;
          });
          if (Object.keys(updates).length) {
            await fetch(`${DB}.json`, { method: "PATCH", body: JSON.stringify(updates), headers: { "Content-Type": "application/json" } });
          }
        }
        processed++;
        console.log(`${user.username}: ${currentBadge} → ${newBadge} (${uniqueDays} days/wk, ${daysSince}d inactive)`);
      }
    } catch (e) { console.error(`Error ${uid}:`, e); }
  }

  return NextResponse.json({ ok: true, processed, total: Object.keys(users).length });
}
