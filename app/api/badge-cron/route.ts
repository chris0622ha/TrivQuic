import { NextRequest, NextResponse } from "next/server";

const DB = "https://onetap-trivia-default-rtdb.firebaseio.com";

// Badge hierarchy
const BADGE_LEVELS = ["none", "star", "bronze", "silver", "gold"];

function getBadgeLevel(badge: string | null): number {
  return BADGE_LEVELS.indexOf(badge || "none");
}

function badgeFromLevel(level: number): string | null {
  if (level <= 0) return null;
  return BADGE_LEVELS[level] || null;
}

async function dbGet(path: string) {
  const res = await fetch(`${DB}/${path}.json`);
  return res.ok ? res.json() : null;
}

async function dbPatch(path: string, data: any) {
  await fetch(`${DB}/${path}.json`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
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
      const history: Record<string, any> = user.loginHistory || {};
      const sessions = Object.values(history).filter((s: any) => s.ts && s.durationMin != null);

      // --- Check last 7 days for earning ---
      const last7Days = sessions.filter((s: any) => now - s.ts < oneWeek);
      const uniqueDays7 = new Set(last7Days.map((s: any) => new Date(s.ts).toDateString())).size;
      const avgMin7 = last7Days.length > 0
        ? last7Days.reduce((sum: number, s: any) => sum + (s.durationMin || 0), 0) / uniqueDays7
        : 0;

      // --- Check for inactivity (demotion) ---
      const lastSession = sessions.sort((a: any, b: any) => b.ts - a.ts)[0];
      const daysSinceLogin = lastSession ? Math.floor((now - lastSession.ts) / oneDay) : 999;

      const currentBadge = user.badge || null;
      const currentLevel = getBadgeLevel(currentBadge);

      // Only auto-manage loyalty badges (star/bronze/silver/gold)
      // Never touch tester, crown, check badges
      const loyaltyBadges = ["star", "bronze", "silver", "gold"];
      const isLoyaltyBadge = loyaltyBadges.includes(currentBadge) || currentBadge === null;
      if (!isLoyaltyBadge) continue;

      let newLevel = currentLevel;

      // --- Earn badge ---
      // Gold: 5+ days, 45+ min avg
      if (uniqueDays7 >= 5 && avgMin7 >= 45) newLevel = 4;
      // Silver: 4+ days, 30+ min avg
      else if (uniqueDays7 >= 4 && avgMin7 >= 30) newLevel = Math.max(newLevel, 3);
      // Bronze: 3+ days, 20+ min avg
      else if (uniqueDays7 >= 3 && avgMin7 >= 20) newLevel = Math.max(newLevel, 2);
      // Star: 3+ days, 10+ min avg
      else if (uniqueDays7 >= 3 && avgMin7 >= 10) newLevel = Math.max(newLevel, 1);

      // --- Lose badge (demotion for inactivity) ---
      // 10+ days inactive → demote one level
      if (daysSinceLogin >= 10 && newLevel > 0) newLevel = newLevel - 1;
      // 21+ days inactive → lose badge entirely
      if (daysSinceLogin >= 21) newLevel = 0;

      const newBadge = badgeFromLevel(newLevel);

      if (newBadge !== currentBadge) {
        await dbPatch(`users/${uid}`, { badge: newBadge });

        // Also update leaderboard entries
        const lb = await dbGet("leaderboard");
        if (lb) {
          const updates: any = {};
          Object.keys(lb).forEach(k => {
            if (k.startsWith(uid + "_") || lb[k]?.uid === uid) {
              updates[`leaderboard/${k}/badge`] = newBadge;
            }
          });
          if (Object.keys(updates).length) {
            await fetch(`${DB}.json`, {
              method: "PATCH",
              body: JSON.stringify(updates),
              headers: { "Content-Type": "application/json" },
            });
          }
        }

        processed++;
        console.log(`${uid} (${user.username}): ${currentBadge} → ${newBadge} (${uniqueDays7}d/wk, ${Math.round(avgMin7)}min avg, ${daysSinceLogin}d inactive)`);
      }
    } catch (e) {
      console.error(`Error processing ${uid}:`, e);
    }
  }

  return NextResponse.json({ ok: true, processed, total: Object.keys(users).length });
}
