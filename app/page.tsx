"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from "react";
import { geography } from "./data/geography";
import { science } from "./data/science";
import { history } from "./data/history";
import { sports } from "./data/sports";
import { entertainment } from "./data/entertainment";
import { math } from "./data/math";

const CATEGORIES = [
  { id: "all", label: "🌎 All Categories", emoji: "🌎", questions: [...geography, ...science, ...history, ...sports, ...entertainment, ...math] },
  { id: "geography", label: "🗺️ Geography", emoji: "🗺️", questions: geography },
  { id: "science", label: "🔬 Science", emoji: "🔬", questions: science },
  { id: "history", label: "📜 History", emoji: "📜", questions: history },
  { id: "sports", label: "⚽ Sports", emoji: "⚽", questions: sports },
  { id: "entertainment", label: "🎬 Entertainment", emoji: "🎬", questions: entertainment },
  { id: "math", label: "🔢 Math", emoji: "🔢", questions: math },
];

function shuffle(arr: any[]): any[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  const [screen, setScreen] = useState("home");
  const [categoryId, setCategoryId] = useState("all");
  const [questions, setQuestions] = useState<any[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(3);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [name, setName] = useState("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [anim, setAnim] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerRef = useRef(false);
  const resultsRef = useRef({ score: 0, correct: 0, total: 0, bestStreak: 0 });
  const gameStateRef = useRef({ score: 0, correct: 0, total: 0, streak: 0, bestStreak: 0 });

  useEffect(() => {
    try {
      setLeaderboard(JSON.parse(localStorage.getItem("onetap_lb3") || "[]"));
      setName(localStorage.getItem("onetap_name") || "");
    } catch {}
  }, []);

  const endGame = useCallback((gs: typeof gameStateRef.current) => {
    if (timerRef.current) clearInterval(timerRef.current);
    resultsRef.current = { score: gs.score, correct: gs.correct, total: gs.total, bestStreak: gs.bestStreak };
    const entry = { name: name || "Anonymous", score: gs.score, streak: gs.bestStreak, date: new Date().toLocaleDateString(), category: categoryId };
    setLeaderboard(prev => {
      const updated = [...prev, entry].sort((a, b) => b.score - a.score).slice(0, 10);
      try { localStorage.setItem("onetap_lb3", JSON.stringify(updated)); } catch {}
      return updated;
    });
    setScreen("result");
  }, [name, categoryId]);

  const handleAnswer = useCallback((ans: string, qs: any[], idx: number) => {
    if (answerRef.current) return;
    answerRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(ans);
    const gs = { ...gameStateRef.current };
    const isCorrect = ans === qs[idx].a;
    gs.streak = isCorrect ? gs.streak + 1 : 0;
    gs.score = isCorrect ? gs.score + 10 + Math.min(gs.streak, 5) * 10 : gs.score;
    gs.correct = isCorrect ? gs.correct + 1 : gs.correct;
    gs.total = gs.total + 1;
    gs.bestStreak = Math.max(gs.streak, gs.bestStreak);
    gameStateRef.current = gs;
    setStreak(gs.streak);
    setAnim(isCorrect ? "pop" : "shake");
    if (isCorrect && gs.streak > 1) { setShowStreak(true); setTimeout(() => setShowStreak(false), 900); }
    setTimeout(() => {
      if (idx + 1 >= qs.length) {
        endGame(gs);
      } else {
        const nextOpts = shuffle([qs[idx+1].a, ...qs[idx+1].w]);
        setQIndex(idx + 1); setOptions(nextOpts); setSelected(null); setTimeLeft(3); setAnim(""); answerRef.current = false;
      }
    }, 800);
  }, [endGame]);

  useEffect(() => {
    if (screen !== "game" || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer("__timeout__", questions, qIndex);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen, qIndex, selected, questions, handleAnswer]);

  function startGame(catId?: string) {
    const id = catId || categoryId;
    const cat = CATEGORIES.find(c => c.id === id)!;
    const qs = shuffle(cat.questions).slice(0, 20);
    const firstOpts = shuffle([qs[0].a, ...qs[0].w]);
    gameStateRef.current = { score: 0, correct: 0, total: 0, streak: 0, bestStreak: 0 };
    setQuestions(qs); setQIndex(0); setOptions(firstOpts); setSelected(null);
    setTimeLeft(3); setStreak(0); setAnim("");
    answerRef.current = false; setScreen("game");
  }

  const q = questions[qIndex];
  const pct = (qIndex / (questions.length || 1)) * 100;
  const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];
  const r = resultsRef.current;

  const LB = () => leaderboard.length > 0 ? (
    <div style={{ width:"100%", maxWidth:440, background:"#1a1a2e", borderRadius:16, padding:"20px" }}>
      <div style={{ fontSize:13, color:"#f59e0b", marginBottom:14, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:700 }}>🏆 Leaderboard</div>
      {leaderboard.slice(0,5).map((e,i) => (
        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 6px", borderBottom: i<4 ? "1px solid #2d2d44" : "none" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18, width:28 }}>{medals[i]}</span>
            <div>
              <div style={{ color:"#e5e7eb", fontWeight:600, fontSize:14 }}>{e.name}</div>
              <div style={{ color:"#4b5563", fontSize:11 }}>{e.category || "all"}</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:"#f59e0b", fontWeight:800, fontSize:18 }}>{e.score}</div>
            <div style={{ color:"#6b7280", fontSize:11 }}>🔥{e.streak}</div>
          </div>
        </div>
      ))}
    </div>
  ) : null;

  if (screen === "home") return (
    <div style={{ minHeight:"100vh", background:"#0f0f1a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px", color:"#fff" }}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ fontSize:56, marginBottom:8 }}>⚡</div>
        <h1 style={{ fontSize:"2.8rem", fontWeight:900, letterSpacing:"-0.03em", margin:0, background:"linear-gradient(135deg, #f59e0b, #ef4444)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>One-Tap Trivia</h1>
        <p style={{ color:"#6b7280", marginTop:8, fontSize:"1rem" }}>3 seconds. One tap. No mercy.</p>
      </div>

      <div style={{ width:"100%", maxWidth:440, background:"#1a1a2e", borderRadius:16, padding:"20px", marginBottom:16 }}>
        <div style={{ fontSize:12, color:"#6b7280", marginBottom:8, letterSpacing:"0.05em", textTransform:"uppercase" }}>Your name</div>
        <input value={name} onChange={e => { setName(e.target.value); try { localStorage.setItem("onetap_name", e.target.value); } catch {} }}
          placeholder="Enter your name..."
          style={{ width:"100%", background:"#0f0f1a", border:"1px solid #2d2d44", borderRadius:10, color:"#fff", fontSize:16, padding:"12px 16px", outline:"none" }} />
      </div>

      <div style={{ width:"100%", maxWidth:440, background:"#1a1a2e", borderRadius:16, padding:"20px", marginBottom:20 }}>
        <div style={{ fontSize:12, color:"#6b7280", marginBottom:12, letterSpacing:"0.05em", textTransform:"uppercase" }}>Choose category</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setCategoryId(cat.id); }}
              style={{ background: categoryId === cat.id ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${categoryId === cat.id ? "#f59e0b" : "#2d2d44"}`,
                borderRadius:10, color: categoryId === cat.id ? "#f59e0b" : "#9ca3af",
                fontSize:13, fontWeight:600, padding:"10px 12px", cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}>
              {cat.label}
              <div style={{ fontSize:10, color:"#4b5563", marginTop:2 }}>{cat.questions.length} questions</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => startGame(categoryId)}
        style={{ background:"linear-gradient(135deg, #f59e0b, #ef4444)", border:"none", borderRadius:14, color:"#fff", fontSize:"1.2rem", fontWeight:800, padding:"18px 56px", cursor:"pointer", marginBottom:32 }}>
        START GAME ⚡
      </button>
      <LB />
    </div>
  );

  if (screen === "result") return (
    <div style={{ minHeight:"100vh", background:"#0f0f1a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px", color:"#fff" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:64, marginBottom:8 }}>{r.correct >= 17 ? "🏆" : r.correct >= 12 ? "🔥" : r.correct >= 7 ? "👍" : "💀"}</div>
        <h2 style={{ fontSize:"2rem", fontWeight:900, margin:0 }}>{r.correct >= 17 ? "Legendary!" : r.correct >= 12 ? "On Fire!" : r.correct >= 7 ? "Not Bad!" : "Keep Practicing!"}</h2>
        <p style={{ color:"#6b7280", marginTop:6, fontSize:"1.1rem" }}>{r.correct} / {r.total} correct</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:32, width:"100%", maxWidth:440 }}>
        {[["Score", r.score, "#f59e0b"], ["Best Streak", r.bestStreak + "🔥", "#ef4444"], ["Accuracy", Math.round((r.correct/(r.total||1))*100) + "%", "#10b981"]].map(([label, val, color]) => (
          <div key={label as string} style={{ background:"#1a1a2e", borderRadius:12, padding:"16px 12px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:900, color:color as string }}>{val}</div>
            <div style={{ fontSize:11, color:"#6b7280", marginTop:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:32 }}>
        <button onClick={() => startGame()} style={{ background:"linear-gradient(135deg, #f59e0b, #ef4444)", border:"none", borderRadius:12, color:"#fff", fontSize:"1rem", fontWeight:800, padding:"14px 28px", cursor:"pointer" }}>PLAY AGAIN ⚡</button>
        <button onClick={() => setScreen("home")} style={{ background:"#1a1a2e", border:"1px solid #2d2d44", borderRadius:12, color:"#9ca3af", fontSize:"1rem", fontWeight:600, padding:"14px 28px", cursor:"pointer" }}>Change Category</button>
      </div>
      <LB />
    </div>
  );

  if (!q) return null;

  return (
    <div style={{ minHeight:"100vh", background:"#0f0f1a", display:"flex", flexDirection:"column", alignItems:"center", padding:"20px", color:"#fff" }}>
      <div style={{ width:"100%", maxWidth:480, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:22, fontWeight:900, color:"#f59e0b" }}>{gameStateRef.current.score}</div>
        <div style={{ fontSize:13, color:"#6b7280" }}>{qIndex + 1} / {questions.length}</div>
        <div style={{ fontSize:16, fontWeight:700, color:streak > 0 ? "#ef4444" : "#4b5563" }}>🔥{streak}</div>
      </div>
      <div style={{ width:"100%", maxWidth:480, height:4, background:"#1a1a2e", borderRadius:2, marginBottom:24, overflow:"hidden" }}>
        <div style={{ height:"100%", width:pct + "%", background:"linear-gradient(90deg, #f59e0b, #ef4444)", borderRadius:2, transition:"width 0.3s" }} />
      </div>
      <div style={{ position:"relative", width:80, height:80, marginBottom:24 }}>
        <svg width="80" height="80" style={{ transform:"rotate(-90deg)" }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke="#1a1a2e" strokeWidth="6" />
          <circle cx="40" cy="40" r="34" fill="none"
            stroke={timeLeft <= 1 ? "#ef4444" : timeLeft <= 2 ? "#f59e0b" : "#10b981"}
            strokeWidth="6" strokeDasharray={213.6} strokeDashoffset={213.6 * (1 - timeLeft / 3)}
            style={{ transition:"stroke-dashoffset 0.9s linear, stroke 0.3s" }} />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:900, color:timeLeft <= 1 ? "#ef4444" : "#fff" }}>
          {selected ? "✓" : timeLeft}
        </div>
      </div>
      {showStreak && (
        <div style={{ position:"fixed", top:"30%", left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg, #f59e0b, #ef4444)", borderRadius:16, padding:"12px 24px", fontSize:22, fontWeight:900, zIndex:100 }}>
          🔥 {streak}x STREAK!
        </div>
      )}
      <div style={{ width:"100%", maxWidth:480, background:"#1a1a2e", borderRadius:20, padding:"28px 24px", marginBottom:20, textAlign:"center" }}>
        <div style={{ fontSize:"1.3rem", fontWeight:700, lineHeight:1.4 }}>{q.q}</div>
      </div>
      <div style={{ width:"100%", maxWidth:480, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {options.map((opt, i) => {
          const isCorrect = opt === q.a;
          const isWrong = selected === opt && !isCorrect;
          const showResult = selected !== null;
          return (
            <button key={i} onClick={() => handleAnswer(opt, questions, qIndex)}
              disabled={!!selected} className={selected === opt ? anim : ""}
              style={{ background: showResult && isCorrect ? "#064e3b" : showResult && isWrong ? "#450a0a" : "#1a1a2e",
                border: `2px solid ${showResult && isCorrect ? "#10b981" : showResult && isWrong ? "#ef4444" : "#2d2d44"}`,
                borderRadius:14, color: showResult && isCorrect ? "#10b981" : showResult && isWrong ? "#ef4444" : "#e5e7eb",
                fontSize:"1rem", fontWeight:700, padding:"20px 16px", cursor:selected ? "default" : "pointer", transition:"all 0.2s", lineHeight:1.3 }}>
              {opt}
            </button>
          );
        })}
      </div>
      {selected === "__timeout__" && (
        <div style={{ marginTop:20, color:"#ef4444", fontWeight:700, fontSize:"1.1rem" }}>
          ⏰ Too slow! Answer: <span style={{ color:"#10b981" }}>{q.a}</span>
        </div>
      )}
    </div>
  );
}
