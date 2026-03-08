import { useState, useEffect, useCallback } from "react";

/*
 * GULF RESIDENT WATCH — gulfresidentwatch.com
 * Real-time conflict impact dashboard for Gulf residents
 * Data sourced from official Ministry of Defense communiqués
 * 
 * Design: Military-utilitarian meets editorial clarity
 * Audience: Expatriates & residents in UAE, Qatar, Bahrain, Kuwait, Saudi Arabia
 */

// ─── VERIFIED DATA: UAE (Source: WAM / UAE MoD) ───
// Latest cumulative figures as of March 8, 2026
const UAE_DATA = {
  country: "UAE", flag: "🇦🇪",
  ballistic: { detected: 221, destroyed: 205, sea: 14, landed: 2 },
  drones: { detected: 1305, intercepted: 1229, landed: 76 },
  cruise: { detected: 8, destroyed: 8 },
  casualties: { dead: 3, injured: 112 },
  deadNationalities: "Pakistani, Nepali, Bangladeshi",
  source: "UAE Ministry of Defence via WAM",
  sourceDate: "8 Mar 2026",
  sourceUrl: "wam.ae",
};

// ─── VERIFIED DATA: BAHRAIN (Source: BDF General Command) ───
const BAHRAIN_DATA = {
  country: "Bahrain", flag: "🇧🇭",
  ballistic: { detected: 78, destroyed: 78, sea: 0, landed: 0 },
  drones: { detected: 143, intercepted: 143, landed: 0 },
  cruise: { detected: 0, destroyed: 0 },
  casualties: { dead: 1, injured: 0 },
  deadNationalities: "Asian worker (vessel maintenance)",
  source: "Bahrain Defence Force General Command",
  sourceDate: "6 Mar 2026",
  sourceUrl: "aljazeera.com",
};

// ─── VERIFIED DATA: QATAR (Source: Qatar MoD) ───
const QATAR_DATA = {
  country: "Qatar", flag: "🇶🇦",
  ballistic: { detected: 66, destroyed: 63, sea: 0, landed: 3 },
  drones: { detected: 49, intercepted: 42, landed: 7 },
  cruise: { detected: 3, destroyed: 3 },
  casualties: { dead: 0, injured: 16 },
  deadNationalities: "",
  notes: "Shot down 2 Iranian Su-24 bombers on Mar 2. First air-to-air engagement of the conflict.",
  source: "Qatar Ministry of Defence / Qatar MoI",
  sourceDate: "6 Mar 2026",
  sourceUrl: "aljazeera.com / navalnews.com",
};

// ─── VERIFIED DATA: KUWAIT (Source: Kuwait MoD) ───
const KUWAIT_DATA = {
  country: "Kuwait", flag: "🇰🇼",
  ballistic: { detected: 97, destroyed: 97, sea: 0, landed: 0 },
  drones: { detected: 283, intercepted: 278, landed: 5 },
  cruise: { detected: 0, destroyed: 0 },
  casualties: { dead: 4, injured: 0 },
  deadNationalities: "Girl (shrapnel), 2 Fire Force officers, 1 other",
  source: "Kuwait Ministry of Defence via Breaking Defense",
  sourceDate: "7 Mar 2026",
  sourceUrl: "breakingdefense.com",
};

// ─── VERIFIED DATA: SAUDI ARABIA (Source: Saudi MoD — limited disclosure) ───
const SAUDI_DATA = {
  country: "Saudi Arabia", flag: "🇸🇦",
  ballistic: { detected: null, destroyed: null, sea: 0, landed: 0 },
  drones: { detected: null, intercepted: null, landed: 0 },
  cruise: { detected: 1, destroyed: 1 },
  casualties: { dead: 0, injured: 0 },
  deadNationalities: "",
  notes: "Saudi Arabia has not released full interception figures. Confirmed: 2 ballistic missiles intercepted at Prince Sultan Air Base, 6 drones near Shaybah oilfield, cruise missile east of al-Kharj, drones east of Riyadh. Targets include Ras Tanura refinery.",
  source: "Saudi Ministry of Defence via Reuters / Al Jazeera",
  sourceDate: "7 Mar 2026",
  sourceUrl: "aljazeera.com",
};

const ALL_COUNTRIES = [UAE_DATA, BAHRAIN_DATA, QATAR_DATA, KUWAIT_DATA, SAUDI_DATA];

// ─── CENTCOM AGGREGATE (for cross-reference) ───
const CENTCOM_TOTALS = {
  missiles: 500, drones: 2000,
  period: "First 4 days",
  source: "Admiral Brad Cooper, CENTCOM",
  sourceDate: "4 Mar 2026",
};

// ─── OIL / ECONOMIC DATA ───
const OIL_TIMELINE = [
  { date: "Feb 25", brent: 70.78, event: null },
  { date: "Feb 28", brent: 74.26, event: "War begins" },
  { date: "Mar 1", brent: 78.47, event: null },
  { date: "Mar 2", brent: 81.80, event: null },
  { date: "Mar 3", brent: 85.41, event: "Hormuz near-standstill" },
  { date: "Mar 4", brent: 84.32, event: null },
  { date: "Mar 5", brent: 81.53, event: null },
  { date: "Mar 6", brent: 85.41, event: "Qatar LNG Force Majeure" },
  { date: "Mar 7", brent: 92.69, event: "Record weekly gain" },
];

// ─── CIVIL STATUS ───
const CIVIL_STATUS = [
  { category: "AVIATION", items: [
    { location: "Dubai Int'l (DXB)", status: "partial", detail: "Limited operations resumed. Intermittent suspensions during active threats.", source: "GDMO / Emirates", date: "8 Mar" },
    { location: "Abu Dhabi (AUH)", status: "partial", detail: "Zayed Int'l operating limited schedule. 1 killed near airport from debris.", source: "GCAA", date: "7 Mar" },
    { location: "Doha (DOH)", status: "closed", detail: "Qatar CAA suspended all air navigation indefinitely. Qatar Airways grounded.", source: "Qatar CAA", date: "8 Mar" },
    { location: "Bahrain (BAH)", status: "partial", detail: "Targeted by drone, material damage. Limited operations.", source: "Bahrain MoI", date: "6 Mar" },
    { location: "Kuwait (KWI)", status: "partial", detail: "Two fuel depots hit by drones causing major fire. Partial operations.", source: "Kuwait DGCA", date: "8 Mar" },
    { location: "Muscat (MCT)", status: "open", detail: "Fully operational. Serving as regional transit hub for evacuations.", source: "Oman Airports", date: "8 Mar" },
  ]},
  { category: "MARITIME", items: [
    { location: "Strait of Hormuz", status: "critical", detail: "Near-zero commercial traffic. Only 4 transits in 24h. 150+ ships anchored outside. War risk insurance withdrawn Mar 5.", source: "UKMTO / Lloyd's", date: "8 Mar" },
    { location: "Jebel Ali Port", status: "partial", detail: "Partial operations resumed after debris damage from interceptions.", source: "DP World", date: "6 Mar" },
  ]},
  { category: "ENERGY", items: [
    { location: "Qatar LNG (Ras Laffan)", status: "critical", detail: "All production ceased. Force Majeure declared. Restart could take weeks.", source: "QatarEnergy / Reuters", date: "6 Mar" },
    { location: "Bahrain (Bapco Sitra)", status: "partial", detail: "Refinery hit by missile. Fire controlled. Operations continuing under review.", source: "Bapco Energies", date: "5 Mar" },
    { location: "Saudi (Ras Tanura)", status: "partial", detail: "Targeted by drones. Temporary shutdown for assessment. Exports via Red Sea pipeline.", source: "Aramco / Reuters", date: "6 Mar" },
  ]},
  { category: "CIVIL DEFENSE", items: [
    { location: "UAE (NCEMA)", status: "active", detail: "Shelter-in-place alerts active. AG warns against sharing attack photos/videos. Schools remote in some emirates.", source: "NCEMA / WAM", date: "8 Mar" },
    { location: "Qatar", status: "active", detail: "Schools moved to remote learning. Public Ramadan gatherings suspended. IRGC cells arrested.", source: "Qatar MoI", date: "6 Mar" },
    { location: "Kuwait", status: "active", detail: "Civil defense measures in place. Airport fuel depot fires being managed.", source: "Kuwait MoI", date: "8 Mar" },
  ]},
];

// ─── KEY STATEMENTS ───
const STATEMENTS = [
  { who: "Trump", role: "US President", flag: "🇺🇸", quote: "Today Iran will be hit very hard!", date: "7 Mar", side: "coalition", source: "Truth Social" },
  { who: "Netanyahu", role: "Israel PM", flag: "🇮🇱", quote: "Many surprises lie ahead for the next phase.", date: "7 Mar", side: "coalition", source: "Times of Israel" },
  { who: "Pezeshkian", role: "Iran President", flag: "🇮🇷", quote: "I apologize to our Gulf neighbors. We will stop striking them from March 7 unless attacks originate from there.", date: "7 Mar", side: "iran", source: "Iranian state media" },
  { who: "Ghalibaf", role: "Iran Speaker", flag: "🇮🇷", quote: "As long as Gulf nations host US bases, they will be subjected to strikes.", date: "7 Mar", side: "iran", source: "Iranian state TV" },
  { who: "IRGC", role: "Revolutionary Guards", flag: "🇮🇷", quote: "We targeted Al Dhafra Air Base in the UAE this morning with a large number of drones.", date: "8 Mar", side: "iran", source: "IRGC via Tasnim" },
  { who: "MBZ", role: "UAE President", flag: "🇦🇪", quote: "We are in a period of war and our forces have played an honorable role.", date: "7 Mar", side: "gulf", source: "WAM" },
  { who: "MBS", role: "Saudi Crown Prince", flag: "🇸🇦", quote: "Continued attacks on the Kingdom could push Riyadh to respond in kind.", date: "7 Mar", side: "gulf", source: "Reuters" },
  { who: "Qatar FM", role: "Majed al-Ansari", flag: "🇶🇦", quote: "All red lines have been crossed. From the north to the south of Qatar.", date: "4 Mar", side: "gulf", source: "Al Jazeera" },
  { who: "Larijani", role: "Iran Security Chief", flag: "🇮🇷", quote: "The Strait is not officially closed, but the war has effectively closed it.", date: "7 Mar", side: "iran", source: "CNBC" },
  { who: "al-Kaabi", role: "Qatar Energy Min.", flag: "🇶🇦", quote: "If war continues, other Gulf producers may halt exports. This will bring down economies of the world.", date: "6 Mar", side: "gulf", source: "Financial Times" },
];

const REGIME_RIFT = {
  title: "IRAN COMMAND CRISIS",
  detail: "President Pezeshkian apologized to Gulf neighbors and ordered strikes to stop. Hours later, IRGC and Speaker Ghalibaf publicly contradicted him, continuing attacks on Dubai airport and Marina. BBC and Reuters analysts interpret this as a breakdown in unified command — the civilian government and Revolutionary Guards are no longer aligned.",
  sources: "BBC, Reuters, WAM, Iranian state media",
};

// ─── STATUS COLORS & HELPERS ───
const statusConfig = {
  open: { color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", label: "OPERATIONAL" },
  partial: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", label: "PARTIAL" },
  closed: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", label: "CLOSED" },
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", label: "CRITICAL" },
  active: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", label: "ACTIVE" },
};

const sideColors = { coalition: "#60a5fa", iran: "#f87171", gulf: "#fbbf24" };
const sideLabels = { coalition: "US/ISRAEL", iran: "IRAN", gulf: "GULF STATES" };

function formatNum(n) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString();
}

function InterceptBar({ intercepted, total, label, color = "#22c55e" }) {
  if (!total) return null;
  const pct = (intercepted / total) * 100;
  const missed = total - intercepted;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: "#8a919e", fontWeight: 600, letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ color: "#c9cdd4" }}>{formatNum(intercepted)}<span style={{ color: "#5a6170" }}> / {formatNum(total)}</span> <span style={{ color: pct > 95 ? "#22c55e" : pct > 85 ? "#f59e0b" : "#ef4444", fontWeight: 700 }}>({pct.toFixed(1)}%)</span></span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.8s ease" }} />
        {missed > 0 && <div style={{ width: `${(missed / total) * 100}%`, background: "#ef4444", opacity: 0.7 }} />}
      </div>
      {missed > 0 && (
        <div style={{ fontSize: 10, color: "#ef4444", marginTop: 2 }}>
          {missed} penetrated defenses
        </div>
      )}
    </div>
  );
}

function OilChart({ data, width = 340, height = 100 }) {
  const prices = data.map(d => d.brent);
  const min = Math.min(...prices) - 3;
  const max = Math.max(...prices) + 3;
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((d.brent - min) / (max - min)) * height,
  }));
  const line = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = line + ` ${width},${height} 0,${height}`;
  const last = pts[pts.length - 1];

  return (
    <svg width={width} height={height + 24} style={{ overflow: "visible", display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="oilFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#oilFill)" />
      <polyline points={line} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" />
      {data.map((d, i) => d.event && (
        <g key={i}>
          <line x1={pts[i].x} y1={pts[i].y} x2={pts[i].x} y2={height} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
          <circle cx={pts[i].x} cy={pts[i].y} r="3" fill="#ef4444" />
        </g>
      ))}
      <circle cx={last.x} cy={last.y} r="5" fill="#0d1117" stroke="#ef4444" strokeWidth="2.5" />
      <text x={last.x - 4} y={last.y - 12} fill="#ef4444" fontSize="13" fontWeight="800" textAnchor="end" fontFamily="inherit">
        ${data[data.length - 1].brent}
      </text>
      {data.map((d, i) => (i % 2 === 0 || i === data.length - 1) && (
        <text key={i} x={pts[i].x} y={height + 16} fill="#5a6170" fontSize="9" textAnchor="middle" fontFamily="inherit">{d.date}</text>
      ))}
    </svg>
  );
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.partial;
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      padding: "2px 8px", borderRadius: 3,
    }}>
      {cfg.label}
    </span>
  );
}

function SourceTag({ source, date, url }) {
  return (
    <div style={{ fontSize: 9, color: "#4a5060", marginTop: 6, fontStyle: "italic" }}>
      Source: {source} · {date}{url ? ` · ${url}` : ""}
    </div>
  );
}

function PulsingDot({ color = "#ef4444", size = 8 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      background: color, boxShadow: `0 0 ${size}px ${color}88`,
      animation: "glow 2s ease-in-out infinite",
    }} />
  );
}

export default function GulfResidentWatch() {
  const [tab, setTab] = useState("defense");
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [now] = useState(new Date());

  const tabs = [
    { id: "defense", label: "AIR DEFENSE" },
    { id: "civil", label: "CIVIL STATUS" },
    { id: "economic", label: "ENERGY & OIL" },
    { id: "statements", label: "STATEMENTS" },
  ];

  const totalMissiles = ALL_COUNTRIES.reduce((s, c) => s + (c.ballistic.detected || 0), 0);
  const totalDrones = ALL_COUNTRIES.reduce((s, c) => s + (c.drones.detected || 0), 0);
  const totalDead = ALL_COUNTRIES.reduce((s, c) => s + c.casualties.dead, 0);
  const totalInjured = ALL_COUNTRIES.reduce((s, c) => s + c.casualties.injured, 0);

  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', 'Fira Code', 'SF Mono', monospace",
      background: "#0d1117", color: "#c9cdd4", minHeight: "100vh",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        @keyframes glow { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes slideIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{
        background: "linear-gradient(180deg, rgba(239,68,68,0.06) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(239,68,68,0.15)", padding: "14px 18px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <PulsingDot />
              <span style={{ fontSize: 9, color: "#ef4444", fontWeight: 700, letterSpacing: "0.2em" }}>LIVE MONITORING</span>
            </div>
            <h1 style={{
              fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: "#f0f2f5",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              Gulf Resident Watch
            </h1>
            <div style={{ fontSize: 10, color: "#5a6170", marginTop: 2, letterSpacing: "0.04em" }}>
              Iran War Impact Dashboard · For residents of the Gulf · Day 9
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f0f2f5", fontFamily: "'IBM Plex Sans', sans-serif" }}>
              8 MAR 2026
            </div>
            <div style={{ fontSize: 9, color: "#5a6170" }}>Data verified from official MoD sources</div>
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
          gap: 6, marginTop: 12,
        }}>
          {[
            { label: "MISSILES", value: formatNum(totalMissiles), sub: "detected in Gulf", color: "#ef4444" },
            { label: "DRONES", value: formatNum(totalDrones), sub: "detected in Gulf", color: "#f97316" },
            { label: "KILLED", value: totalDead.toString(), sub: "in Gulf states", color: "#ef4444" },
            { label: "INJURED", value: formatNum(totalInjured), sub: "in Gulf states", color: "#f59e0b" },
            { label: "BRENT", value: "$92.69", sub: "+35% this week", color: "#ef4444" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 6, padding: "8px 10px",
            }}>
              <div style={{ fontSize: 8, color: "#5a6170", letterSpacing: "0.12em", fontWeight: 600 }}>{stat.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: stat.color, fontFamily: "'IBM Plex Sans', sans-serif" }}>{stat.value}</div>
              <div style={{ fontSize: 8, color: "#4a5060" }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ═══ HORMUZ ALERT ═══ */}
      <div style={{ padding: "10px 18px 0" }}>
        <div style={{
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12,
        }}>
          <PulsingDot color="#ef4444" size={10} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", letterSpacing: "0.06em" }}>
              STRAIT OF HORMUZ — EFFECTIVELY CLOSED
            </div>
            <div style={{ fontSize: 10, color: "#8a919e", marginTop: 2 }}>
              Only 4 commercial transits in 24h · 150+ ships anchored outside · War risk insurance withdrawn Mar 5 · 20% of global crude affected
            </div>
            <div style={{ fontSize: 9, color: "#4a5060", marginTop: 2, fontStyle: "italic" }}>
              Sources: UKMTO, Lloyd's List, Wall Street Journal · 8 Mar 2026
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <nav style={{
        display: "flex", gap: 0, padding: "10px 18px 0", overflowX: "auto",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "8px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            color: tab === t.id ? "#ef4444" : "#5a6170",
            borderBottom: tab === t.id ? "2px solid #ef4444" : "2px solid transparent",
            fontFamily: "inherit", whiteSpace: "nowrap", transition: "color 0.2s",
          }}>
            {t.label}
          </button>
        ))}
      </nav>

      {/* ═══ CONTENT ═══ */}
      <main style={{ padding: "16px 18px" }}>

        {/* ── AIR DEFENSE TAB ── */}
        {tab === "defense" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ fontSize: 11, color: "#5a6170", marginBottom: 14, lineHeight: 1.6 }}>
              Interception data from official Ministry of Defense communiqués of each Gulf state.
              First time in history Iran has attacked all six GCC countries simultaneously.
              Tap any country for details.
            </div>

            {/* CENTCOM cross-reference */}
            <div style={{
              background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)",
              borderRadius: 6, padding: "8px 12px", marginBottom: 14, fontSize: 10,
            }}>
              <span style={{ color: "#60a5fa", fontWeight: 700 }}>CENTCOM TOTAL:</span>{" "}
              <span style={{ color: "#8a919e" }}>
                Iran launched ~{CENTCOM_TOTALS.missiles} missiles and ~{CENTCOM_TOTALS.drones.toLocaleString()} drones in first 4 days across all targets (Gulf + Israel).
              </span>
              <span style={{ color: "#4a5060", fontStyle: "italic" }}> — Adm. Brad Cooper, 4 Mar</span>
            </div>

            {ALL_COUNTRIES.map((c, i) => {
              const isExpanded = expandedCountry === i;
              const totalProjectiles = (c.ballistic.detected || 0) + (c.drones.detected || 0) + (c.cruise.detected || 0);
              return (
                <div key={i}
                  onClick={() => setExpandedCountry(isExpanded ? null : i)}
                  style={{
                    background: isExpanded ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
                    border: `1px solid ${isExpanded ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)"}`,
                    borderRadius: 8, padding: "12px 14px", marginBottom: 8, cursor: "pointer",
                    transition: "all 0.2s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{c.flag}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f2f5", fontFamily: "'IBM Plex Sans', sans-serif" }}>
                          {c.country}
                        </div>
                        <div style={{ fontSize: 10, color: "#5a6170" }}>
                          {totalProjectiles > 0 ? `${formatNum(totalProjectiles)} total projectiles detected` : "Limited data released"}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {c.casualties.dead > 0 && (
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{c.casualties.dead} killed</div>
                      )}
                      {c.casualties.injured > 0 && (
                        <div style={{ fontSize: 10, color: "#f59e0b" }}>{c.casualties.injured} injured</div>
                      )}
                      <div style={{ fontSize: 9, color: "#4a5060", marginTop: 2 }}>{isExpanded ? "▲" : "▼"}</div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      {c.ballistic.detected !== null && (
                        <InterceptBar
                          label="BALLISTIC MISSILES"
                          intercepted={c.ballistic.destroyed + c.ballistic.sea}
                          total={c.ballistic.detected}
                          color="#60a5fa"
                        />
                      )}
                      {c.drones.detected !== null && (
                        <InterceptBar
                          label="DRONES (UAV)"
                          intercepted={c.drones.intercepted}
                          total={c.drones.detected}
                          color="#22c55e"
                        />
                      )}
                      {c.cruise.detected > 0 && (
                        <InterceptBar
                          label="CRUISE MISSILES"
                          intercepted={c.cruise.destroyed}
                          total={c.cruise.detected}
                          color="#a78bfa"
                        />
                      )}
                      {c.deadNationalities && (
                        <div style={{ fontSize: 10, color: "#8a919e", marginTop: 4 }}>
                          Casualties: {c.deadNationalities}
                        </div>
                      )}
                      {c.notes && (
                        <div style={{
                          fontSize: 10, color: "#f59e0b", marginTop: 8,
                          background: "rgba(245,158,11,0.06)", padding: "6px 10px", borderRadius: 4,
                        }}>
                          {c.notes}
                        </div>
                      )}
                      <SourceTag source={c.source} date={c.sourceDate} url={c.sourceUrl} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Note on data discrepancies */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: 6, padding: "10px 12px", marginTop: 12, fontSize: 10, color: "#5a6170", lineHeight: 1.6,
            }}>
              <span style={{ fontWeight: 700, color: "#8a919e" }}>⚠ DATA NOTE:</span> Figures may differ across sources because MoDs release cumulative updates at different times. We prioritize official government communiqués over media reports. Saudi Arabia has not released full interception totals. CENTCOM aggregate includes strikes on Israel and non-GCC countries. Numbers are updated as new official statements are released.
            </div>
          </div>
        )}

        {/* ── CIVIL STATUS TAB ── */}
        {tab === "civil" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ fontSize: 11, color: "#5a6170", marginBottom: 14 }}>
              Operational status of critical infrastructure across the Gulf. Data from official aviation authorities, port operators, and civil defense agencies.
            </div>

            {CIVIL_STATUS.map((section, si) => (
              <div key={si} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#8a919e",
                  marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                  {section.category}
                </div>
                {section.items.map((item, ii) => (
                  <div key={ii} style={{
                    background: statusConfig[item.status]?.bg || "transparent",
                    border: `1px solid ${statusConfig[item.status]?.border || "rgba(255,255,255,0.04)"}`,
                    borderRadius: 6, padding: "10px 12px", marginBottom: 6,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#f0f2f5", fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        {item.location}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <div style={{ fontSize: 11, color: "#8a919e", lineHeight: 1.5 }}>{item.detail}</div>
                    <SourceTag source={item.source} date={item.date} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── ENERGY & OIL TAB ── */}
        {tab === "economic" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "#5a6170", letterSpacing: "0.1em", marginBottom: 4 }}>BRENT CRUDE OIL</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: "#ef4444", fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  $92.69
                </span>
                <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>+35.6% this week</span>
              </div>
              <div style={{ fontSize: 11, color: "#8a919e", marginTop: 2 }}>
                Largest weekly gain in futures trading history (since 1983)
              </div>
              <div style={{ fontSize: 9, color: "#4a5060", fontStyle: "italic" }}>
                Source: CNBC, OilPrice.com · 7 Mar 2026 close
              </div>
            </div>

            <div style={{ maxWidth: 360, margin: "0 auto 20px" }}>
              <OilChart data={OIL_TIMELINE} />
            </div>

            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#8a919e",
              marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              SUPPLY CHAIN IMPACT
            </div>

            {[
              { label: "Strait of Hormuz", value: "Near-zero traffic", status: "critical", source: "UKMTO" },
              { label: "Iraq production", value: "−1.5M barrels/day", status: "critical", source: "Reuters" },
              { label: "Kuwait production", value: "Cutting output", status: "warning", source: "WSJ" },
              { label: "Qatar LNG", value: "Force Majeure declared", status: "critical", source: "QatarEnergy" },
              { label: "Goldman Sachs forecast", value: ">$100/bbl next week possible", status: "alert", source: "Goldman Sachs" },
              { label: "US gasoline", value: "+$0.27/gal in 1 week", status: "warning", source: "AAA/CNBC" },
              { label: "European gas", value: "+50% surge", status: "critical", source: "Bloomberg" },
              { label: "Shipping insurance", value: "Withdrawn for Persian Gulf", status: "critical", source: "Lloyd's List" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)",
              }}>
                <div>
                  <span style={{ fontSize: 11, color: "#8a919e" }}>{item.label}</span>
                  <span style={{ fontSize: 9, color: "#4a5060", marginLeft: 6 }}>{item.source}</span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: item.status === "critical" ? "#ef4444" : item.status === "alert" ? "#f59e0b" : "#c9cdd4",
                }}>{item.value}</span>
              </div>
            ))}

            {/* Key events on chart */}
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#8a919e",
              marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              PRICE DRIVERS
            </div>
            {OIL_TIMELINE.filter(d => d.event).map((d, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "baseline", padding: "4px 0",
              }}>
                <span style={{ fontSize: 10, color: "#5a6170", minWidth: 48 }}>{d.date}</span>
                <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>${d.brent}</span>
                <span style={{ fontSize: 10, color: "#8a919e" }}>{d.event}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── STATEMENTS TAB ── */}
        {tab === "statements" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ fontSize: 11, color: "#5a6170", marginBottom: 14 }}>
              Key declarations from conflict parties. Note the internal rift within Iran's leadership.
            </div>

            {/* Regime rift alert */}
            <div style={{
              background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: 8, padding: "12px 14px", marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.06em", marginBottom: 6 }}>
                ⚠ {REGIME_RIFT.title}
              </div>
              <div style={{ fontSize: 11, color: "#8a919e", lineHeight: 1.6 }}>{REGIME_RIFT.detail}</div>
              <div style={{ fontSize: 9, color: "#4a5060", marginTop: 4, fontStyle: "italic" }}>
                Sources: {REGIME_RIFT.sources}
              </div>
            </div>

            {/* Group by side */}
            {["gulf", "iran", "coalition"].map(side => (
              <div key={side} style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
                  color: sideColors[side], marginBottom: 6,
                  paddingBottom: 4, borderBottom: `1px solid ${sideColors[side]}22`,
                }}>
                  {sideLabels[side]}
                </div>
                {STATEMENTS.filter(s => s.side === side).map((s, i) => (
                  <div key={i} style={{
                    borderLeft: `3px solid ${sideColors[side]}`,
                    padding: "10px 14px", marginBottom: 6, borderRadius: "0 6px 6px 0",
                    background: `${sideColors[side]}08`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{s.flag}</span>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#f0f2f5" }}>{s.who}</span>
                          <span style={{ fontSize: 10, color: "#5a6170", marginLeft: 6 }}>{s.role}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 9, color: "#4a5060" }}>{s.date}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#c9cdd4", fontStyle: "italic", lineHeight: 1.5 }}>
                      "{s.quote}"
                    </div>
                    <div style={{ fontSize: 9, color: "#4a5060", marginTop: 4 }}>via {s.source}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        padding: "16px 18px", borderTop: "1px solid rgba(255,255,255,0.04)",
        fontSize: 9, color: "#3a4050", lineHeight: 1.6, textAlign: "center",
      }}>
        <div style={{ marginBottom: 4 }}>
          <strong style={{ color: "#5a6170" }}>gulfresidentwatch.com</strong> · Independent conflict impact tracker for Gulf residents
        </div>
        <div>
          Data sourced from: UAE MoD (WAM), Qatar MoD, Bahrain Defence Force, Kuwait MoD, Saudi MoD, CENTCOM, UKMTO, Lloyd's List, CNBC, Reuters, Al Jazeera, Bloomberg.
          Figures reflect latest official communiqués and may differ from media reports. Last verified: 8 Mar 2026.
        </div>
        <div style={{ marginTop: 4, color: "#2a3040" }}>
          This dashboard is for informational purposes only. Always follow official civil defense instructions (NCEMA, Qatar MoI, etc.).
        </div>
      </footer>
    </div>
  );
}
