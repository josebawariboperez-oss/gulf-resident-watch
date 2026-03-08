import { useState, useCallback } from "react";

const LAST_UPDATED = "8 Mar 2026, 18:00 GST";
const DAY = 9;
const HD = "'IBM Plex Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', 'Menlo', monospace";

// ── ESCALATION DATA ──
const ESC = [
  { d: "D1", s: 95, note: "War begins, all GCC struck" },
  { d: "D2", s: 90, note: "Hormuz threatened, oil spikes" },
  { d: "D3", s: 85, note: "Qatar downs Su-24s" },
  { d: "D4", s: 88, note: "Nuclear sites struck" },
  { d: "D5", s: 82, note: "Iran navy destroyed" },
  { d: "D6", s: 80, note: "Refineries hit" },
  { d: "D7", s: 78, note: "LNG Force Majeure" },
  { d: "D8", s: 85, note: "Iran rift, Dubai hit" },
  { d: "D9", s: 83, note: "Attacks continue" },
];

// ── BUSINESS & OPERATIONS ──
const BIZ_OPS = [
  { cat: "FINANCIAL MARKETS", status: "partial", color: "#f59e0b", items: [
    { what: "DFM (Dubai Financial Market)", detail: "Reopened Mar 4. Fell 4.7% — sharpest drop since May 2022.", src: "Bloomberg", url: "https://www.bloomberg.com/news/articles/2026-03-06/iran-war-drone-missile-attacks-reshape-dubai-financial-district-at-ramadan" },
    { what: "ADX (Abu Dhabi Securities)", detail: "Reopened Mar 4. Down 1.9%.", src: "Bloomberg", url: "" },
    { what: "Nasdaq Dubai", detail: "Reopened Mar 4 per DFSA announcement.", src: "DFSA", url: "" },
    { what: "Gold demand", detail: "Surging. Bar demand up sharply across Dubai jewellers.", src: "CNBC", url: "https://www.cnbc.com/2026/03/05/iran-war-dubai-rich.html" },
  ]},
  { cat: "FREE ZONES & OFFICES", status: "partial", color: "#f59e0b", items: [
    { what: "DIFC", detail: "Operational but 'eerily quiet'. ICD Brookfield near-empty. Bankers and high-end clientele largely absent. Top 120 families manage $1.2T here.", src: "Bloomberg", url: "https://www.bloomberg.com/news/articles/2026-03-06/iran-war-drone-missile-attacks-reshape-dubai-financial-district-at-ramadan" },
    { what: "ADGM", detail: "Operational. Banks, Mubadala offices open.", src: "The Business Year", url: "https://thebusinessyear.com/article/2026-middle-east-conflict-why-the-gulf-will-endure/" },
    { what: "DMCC, JAFZA, IFZA, RAKEZ", detail: "All operational with security measures. Services continue.", src: "digitaldubai.ai", url: "https://www.digitaldubai.ai/dubai-updates/iran-attacks-dubai-march-2026-damage-locations-updates" },
    { what: "Shams (Sharjah), SAIF Zone", detail: "Operational. Port of Sharjah open with increased security.", src: "Various", url: "" },
  ]},
  { cat: "LOGISTICS & SHIPPING", status: "critical", color: "#ef4444", items: [
    { what: "Strait of Hormuz", detail: "Near-zero traffic. 150+ ships anchored outside. All major lines suspended (Maersk, MSC, Hapag-Lloyd, CMA CGM).", src: "UKMTO / Lloyd's", url: "https://www.cnbc.com/2026/03/07/not-slowing-down-one-week-on-us-israeli-strikes-on-iran-continue.html" },
    { what: "Jebel Ali Port", detail: "Partial ops after debris damage and fire. Some cargo moving.", src: "DP World", url: "" },
    { what: "War risk insurance", detail: "Withdrawn for Persian Gulf effective Mar 5. Companies cannot insure shipments through Hormuz.", src: "Lloyd's List", url: "" },
    { what: "Fujairah Port", detail: "Gaining importance — outside Hormuz chokepoint. Industrial zone hit Mar 5.", src: "Al Jazeera", url: "https://www.aljazeera.com/news/2026/3/5/iran-fires-more-missiles-drones-across-gulf-region-amid-us-israeli-attacks" },
  ]},
  { cat: "AVIATION & TRAVEL", status: "partial", color: "#f59e0b", items: [
    { what: "DXB (Dubai)", detail: "Limited ops. Emirates & flydubai partial schedules. DWC as alternative. ~20,000 passengers stranded.", src: "GDMO / Gulf News", url: "https://gulfnews.com/uae/usisrael-war-on-iran-day-8-new-wave-of-airstrikes-hits-tehran-uae-confirms-full-readiness-emirates-cancels-all-dubai-flights-1.500466181" },
    { what: "AUH (Abu Dhabi)", detail: "Limited schedule. Evacuation flights running.", src: "GCAA", url: "" },
    { what: "DOH (Doha)", detail: "Closed indefinitely. Qatar Airways grounded. ~8,000 stranded in transit.", src: "Qatar CAA", url: "" },
    { what: "MCT (Muscat)", detail: "Fully operational. Main regional evacuation hub. Alternative routing.", src: "Oman Airports", url: "https://www.middleeastbriefing.com/news/iran-war-gulf-business-tracker-and-operations-resumption/" },
    { what: "Private jets", detail: "Demand surging. 100+ inquiries overnight. Riyadh-Europe up to $350,000.", src: "CNBC", url: "https://www.cnbc.com/2026/03/05/iran-war-dubai-rich.html" },
  ]},
  { cat: "ENERGY SUPPLY CHAIN", status: "critical", color: "#ef4444", items: [
    { what: "Qatar LNG (Ras Laffan)", detail: "All production ceased. Force Majeure declared. Restart weeks away. EU gas prices +50%.", src: "QatarEnergy / Bloomberg", url: "" },
    { what: "Saudi (Ras Tanura)", detail: "Targeted by drones. Temp shutdown. Exports via Red Sea pipeline continue.", src: "Reuters", url: "" },
    { what: "Bahrain (Bapco Sitra)", detail: "Refinery hit. Fire controlled quickly. No injuries. Under review.", src: "Bapco", url: "" },
    { what: "Kuwait oil", detail: "Cutting production due to Hormuz threats and storage full.", src: "WSJ", url: "" },
  ]},
  { cat: "WORKFORCE & LEGAL", status: "caution", color: "#f59e0b", items: [
    { what: "Remote work", detail: "Many Dubai and Abu Dhabi firms operating remotely. Government hasn't mandated but firms choosing caution.", src: "Various", url: "" },
    { what: "Schools", detail: "Parts of UAE and all of Qatar moved to remote learning.", src: "NCEMA / Qatar MoI", url: "" },
    { what: "Insurance claims", detail: "War exclusion clauses likely apply. Contact provider immediately for business interruption and property damage.", src: "digitaldubai.ai", url: "https://www.digitaldubai.ai/dubai-updates/iran-attacks-dubai-march-2026-damage-locations-updates" },
    { what: "Force Majeure", detail: "Companies with Gulf operations should review contracts. QatarEnergy already invoked FM on LNG deliveries.", src: "Reuters", url: "" },
    { what: "Staff evacuation", detail: "US State Dept urging Americans to leave. Multiple embassy evacuations. Check your embassy's advisory.", src: "US State Dept", url: "https://www.cfr.org/global-conflict-tracker/conflict/confrontation-between-united-states-and-iran" },
    { what: "Hiring", detail: "Some firms pre-planning layoffs and halting fundraising. Investment firms pausing activity.", src: "CNBC / Bloomberg", url: "https://www.cnbc.com/2026/03/05/iran-war-dubai-rich.html" },
  ]},
];

// ── DEFENSE ──
const DEF = [
  { c: "UAE", f: "🇦🇪", bm: [221, 205, 14, 2], dr: [1305, 1229, 76], cr: [8, 8], dead: 4, inj: 112, who: "Pakistani, Nepali, Bangladeshi nationals + motorist (Al Barsha)", src: "UAE MoD (WAM) + The National", dt: "8 Mar" },
  { c: "Kuwait", f: "🇰🇼", bm: [97, 97, 0, 0], dr: [283, 278, 5], cr: [0, 0], dead: 4, inj: 0, who: "1 girl, 2 Fire Force officers, 1 other", src: "Kuwait MoD / Breaking Defense", dt: "7 Mar" },
  { c: "Bahrain", f: "🇧🇭", bm: [78, 78, 0, 0], dr: [143, 143, 0], cr: [0, 0], dead: 1, inj: 0, who: "Worker (vessel debris)", src: "BDF General Command", dt: "6 Mar" },
  { c: "Qatar", f: "🇶🇦", bm: [66, 63, 0, 3], dr: [49, 42, 7], cr: [3, 3], dead: 0, inj: 16, note: "Shot down 2 Iranian Su-24s — first air-to-air kill of the war.", src: "Qatar MoD / Naval News", dt: "6 Mar" },
  { c: "Saudi Arabia", f: "🇸🇦", bm: null, dr: null, cr: [1, 1], dead: 0, inj: 0, note: "Limited disclosure. Confirmed: 2 BMs at Prince Sultan AB, drones at Shaybah & near Riyadh, cruise missile at al-Kharj. Ras Tanura targeted.", src: "Saudi MoD via Reuters", dt: "7 Mar" },
];

// ── EVENTS ──
const EV = [
  { t: "8 Mar 16:00", h: "UAE intercepts 15 ballistic missiles, 119/121 drones", s: "UAE MoD", tp: "defense", hot: true, url: "https://www.thenationalnews.com/news/uae/2026/03/07/uae-defences-iran-missile-attacks/" },
  { t: "8 Mar 14:00", h: "Motorist killed by interception debris in Al Barsha, Dubai", s: "Dubai Police", tp: "casualty", hot: true, url: "https://www.thenationalnews.com/news/uae/2026/03/07/uae-defences-iran-missile-attacks/" },
  { t: "8 Mar 12:00", h: "Three NCEMA safety alerts issued across UAE", s: "NCEMA", tp: "alert", hot: false, url: "" },
  { t: "8 Mar 10:00", h: "IRGC claims targeting Al Dhafra Air Base with large drone wave", s: "Tasnim", tp: "attack", hot: true, url: "" },
  { t: "8 Mar 08:00", h: "Pezeshkian backtracks on apology to Gulf states", s: "The National", tp: "political", hot: true, url: "https://www.thenationalnews.com/news/uae/2026/03/07/uae-defences-iran-missile-attacks/" },
  { t: "8 Mar 06:00", h: "Kuwait: two fuel depots at airport hit by drones, huge fire", s: "CNBC", tp: "attack", hot: true, url: "https://www.cnbc.com/2026/03/08/iranian-projectiles-continue-to-strike-gulf-countries-infrastructure.html" },
  { t: "8 Mar 04:00", h: "Bahrain: drone strikes water desalination plant, no supply impact", s: "Bahrain MoI", tp: "attack", hot: false, url: "" },
  { t: "7 Mar 22:00", h: "Dubai Int'l partially resumes — Emirates operates limited flights", s: "GDMO", tp: "civil", hot: true, url: "https://gulfnews.com/uae/usisrael-war-on-iran-day-8-new-wave-of-airstrikes-hits-tehran-uae-confirms-full-readiness-emirates-cancels-all-dubai-flights-1.500466181" },
  { t: "7 Mar 20:00", h: "Ain Dubai and Dubai Parks closed for the weekend", s: "Gulf News", tp: "civil", hot: false, url: "https://gulfnews.com/uae/usisrael-war-on-iran-day-8-new-wave-of-airstrikes-hits-tehran-uae-confirms-full-readiness-emirates-cancels-all-dubai-flights-1.500466181" },
  { t: "7 Mar 18:00", h: "Saudi warns continued attacks could force military response", s: "Reuters", tp: "political", hot: true, url: "" },
  { t: "7 Mar 14:00", h: "Iranian drones hit DXB and Dubai Marina tower despite ceasefire promise", s: "WAM", tp: "attack", hot: true, url: "https://en.wikipedia.org/wiki/2026_Iranian_strikes_on_the_United_Arab_Emirates" },
  { t: "7 Mar 12:00", h: "Ghalibaf overrules Pezeshkian — 'attacks continue while US bases remain'", s: "Iranian TV", tp: "political", hot: true, url: "" },
  { t: "7 Mar 09:00", h: "Pezeshkian apologizes to Gulf neighbors, orders strikes to stop", s: "Iranian media", tp: "political", hot: true, url: "" },
  { t: "7 Mar 06:00", h: "Brent closes at $92.69 — largest weekly gain in futures history since 1983", s: "CNBC", tp: "economic", hot: true, url: "https://www.cnbc.com/2026/03/06/iran-us-war-oil-prices-brent-wti-barrel-futures.html" },
  { t: "6 Mar 20:00", h: "UAE MoD: 205 BMs, 1,184 drones detected since Feb 28", s: "WAM", tp: "defense", hot: false, url: "https://www.wam.ae/en/article/bz3mqg3-uae-air-defences-intercept-ballistic-missiles-113" },
  { t: "6 Mar 16:00", h: "Drone targets Israeli embassy area in Bahrain Financial Harbour", s: "Reuters / BDF", tp: "attack", hot: true, url: "https://www.aljazeera.com/news/2026/3/6/iran-targets-israeli-embassy-in-bahrain-saudi-arabia-intercepts-missile" },
  { t: "6 Mar 14:00", h: "DFM reopens — index falls 4.7%, sharpest drop since May 2022", s: "Bloomberg", tp: "economic", hot: true, url: "" },
  { t: "6 Mar 12:00", h: "Qatar energy minister: 'this will bring down economies of the world'", s: "Financial Times", tp: "economic", hot: true, url: "" },
  { t: "6 Mar 08:00", h: "War risk insurance withdrawn for all Persian Gulf shipping", s: "Lloyd's List", tp: "economic", hot: true, url: "" },
  { t: "5 Mar 16:00", h: "Explosion in Fujairah industrial zone from drone interception", s: "Al Jazeera", tp: "attack", hot: false, url: "https://www.aljazeera.com/news/2026/3/5/iran-fires-more-missiles-drones-across-gulf-region-amid-us-israeli-attacks" },
  { t: "5 Mar 10:00", h: "DIFC 'eerily quiet' — bankers and Rolls-Royces gone", s: "Bloomberg", tp: "economic", hot: false, url: "https://www.bloomberg.com/news/articles/2026-03-06/iran-war-drone-missile-attacks-reshape-dubai-financial-district-at-ramadan" },
  { t: "5 Mar 06:00", h: "Private jet demand surges — 100+ inquiries overnight from Dubai", s: "CNBC", tp: "civil", hot: false, url: "https://www.cnbc.com/2026/03/05/iran-war-dubai-rich.html" },
  { t: "4 Mar 12:00", h: "UAE MoD: 189 BMs, 941 drones detected. 8 cruise missiles destroyed.", s: "WAM", tp: "defense", hot: false, url: "" },
  { t: "3 Mar 08:00", h: "US/Israel destroy SNSC HQ, Min Zadai nuclear facility, Bushehr airport", s: "Multiple", tp: "attack", hot: true, url: "https://en.wikipedia.org/wiki/2026_Iran_war" },
  { t: "2 Mar 14:00", h: "Qatar shoots down 2 Iranian Su-24 bombers — first air-to-air kill", s: "Qatar MoD", tp: "defense", hot: true, url: "https://www.navalnews.com/naval-news/2026/03/qatar-emiri-navy-intercepts-iranian-missiles-and-drones/" },
  { t: "2 Mar 10:00", h: "QatarEnergy halts all LNG production, declares Force Majeure", s: "Reuters", tp: "economic", hot: true, url: "" },
  { t: "1 Mar 08:00", h: "Trump announces 4-week timetable for operations, accepts Iran talks", s: "Daily Mail", tp: "political", hot: true, url: "" },
  { t: "28 Feb 02:00", h: "US and Israel launch Operation Epic Fury — Khamenei killed", s: "Multiple", tp: "attack", hot: true, url: "https://en.wikipedia.org/wiki/2026_Iran_war" },
];

// ── IMPACT Q&A ──
const QA = [
  { q: "Is it safe outside?", a: "Follow NCEMA alerts. Shelter-in-place during interceptions. Between attacks, life continues but stay near shelter. AG warns against filming attacks.", status: "caution", icon: "🏠" },
  { q: "Can I fly out?", a: "DXB & AUH: limited, changes hourly. Doha: closed indefinitely. Muscat: fully open — main evacuation hub. Check airline directly.", status: "partial", icon: "✈️" },
  { q: "Food & water?", a: "Supermarkets stocked (Carrefour pre-stocked). Water stable. Bahrain desalination hit but no supply impact. Fuel at pump normal but rising.", status: "stable", icon: "🛒" },
  { q: "Work & schools?", a: "Many offices remote. Some UAE schools and all Qatar schools online. Jebel Ali Port partial. Markets volatile but open.", status: "caution", icon: "💼" },
  { q: "Oil & petrol?", a: "Brent $92.69 (+35% weekly). Hormuz effectively closed. Goldman: >$100 next week possible. Qatar LNG shutdown → EU gas +50%.", status: "warning", icon: "⛽" },
];

// ── OIL ──
const OIL = [
  { d: "Feb 25", b: 70.78 }, { d: "Feb 28", b: 74.26, e: "War starts" },
  { d: "Mar 1", b: 78.47 }, { d: "Mar 2", b: 81.80 },
  { d: "Mar 3", b: 85.41, e: "Hormuz shuts" }, { d: "Mar 4", b: 84.32 },
  { d: "Mar 5", b: 81.53 }, { d: "Mar 6", b: 85.41, e: "LNG halt" },
  { d: "Mar 7", b: 92.69, e: "Record week" },
];

// ── STATEMENTS ──
const STMT = [
  { who: "MBZ", role: "UAE President", flag: "🇦🇪", q: "We are in a period of war and our forces have played an honorable role.", d: "7 Mar", side: "gulf", via: "WAM" },
  { who: "MBS", role: "Saudi Crown Prince", flag: "🇸🇦", q: "Continued attacks could force a Saudi military response.", d: "7 Mar", side: "gulf", via: "Reuters" },
  { who: "al-Kaabi", role: "Qatar Energy Min.", flag: "🇶🇦", q: "Gulf producers may halt exports. This will bring down economies of the world.", d: "6 Mar", side: "gulf", via: "FT" },
  { who: "Qatar FM", role: "al-Ansari", flag: "🇶🇦", q: "All red lines have been crossed. From north to south of Qatar.", d: "4 Mar", side: "gulf", via: "Al Jazeera" },
  { who: "UAE AG", role: "Dr Al Shamsi", flag: "🇦🇪", q: "Stop sharing attack footage. Daily life continues normally while measures are taken.", d: "7 Mar", side: "gulf", via: "WAM" },
  { who: "al-Mudahka", role: "Qatar Diplomat", flag: "🇶🇦", q: "We are not war seekers. We don't want to be dragged into this for the ideology of Netanyahu and Iran.", d: "3 Mar", side: "gulf", via: "Al Jazeera" },
  { who: "Pezeshkian", role: "Iran President", flag: "🇮🇷", q: "I apologize to our Gulf neighbors. Strikes will cease from March 7.", d: "7 Mar", side: "iran", via: "State media" },
  { who: "Ghalibaf", role: "Iran Speaker", flag: "🇮🇷", q: "As long as Gulf nations host US bases, strikes will continue.", d: "7 Mar", side: "iran", via: "Iranian TV" },
  { who: "IRGC", role: "Rev. Guards", flag: "🇮🇷", q: "We targeted Al Dhafra with a large number of drones. This operation will continue relentlessly.", d: "8 Mar", side: "iran", via: "Tasnim" },
  { who: "Larijani", role: "Security Chief", flag: "🇮🇷", q: "The Strait is not officially closed, but the war has closed it.", d: "7 Mar", side: "iran", via: "CNBC" },
  { who: "Araghchi", role: "Iran FM", flag: "🇮🇷", q: "We are not targeting our brothers or neighbors in the Persian Gulf.", d: "3 Mar", side: "iran", via: "Al Jazeera" },
  { who: "Trump", role: "US President", flag: "🇺🇸", q: "Today Iran will be hit very hard!", d: "7 Mar", side: "us", via: "Truth Social" },
  { who: "Hegseth", role: "Defense Sec.", flag: "🇺🇸", q: "We are just getting started. Expect larger waves.", d: "5 Mar", side: "us", via: "CNN" },
  { who: "Netanyahu", role: "Israel PM", flag: "🇮🇱", q: "Many surprises lie ahead for the next phase.", d: "7 Mar", side: "us", via: "Times of Israel" },
  { who: "Starmer", role: "UK PM", flag: "🇬🇧", q: "US can use British bases for defensive strikes on Iran.", d: "2 Mar", side: "us", via: "BBC" },
  { who: "Petraeus", role: "Fmr CIA Dir.", flag: "🇺🇸", q: "Iran's targeting of Gulf states was likely a strategic error that could pull more countries into the war.", d: "3 Mar", side: "us", via: "Reuters" },
];

// ── EMBASSY ADVISORIES ──
const EMBASSIES = [
  { country: "United States", flag: "🇺🇸", pop: "~100,000 in UAE", advisory: "LEAVE IMMEDIATELY", color: "#ef4444",
    detail: "Ordered departure of non-emergency personnel (Mar 2). Urges all citizens to leave 16+ Middle East countries. Embassy Abu Dhabi & Consulate Dubai: all visa appointments cancelled. Embassies in Saudi & Kuwait closed after strikes.",
    hotline: "+1-202-501-4444 (abroad) / +1-888-407-4747 (US)", action: "Enroll in STEP. Complete crisis intake form online.",
    url: "https://ae.usembassy.gov/security-alert-u-s-mission-to-the-uae-march-5-2026/" },
  { country: "United Kingdom", flag: "🇬🇧", pop: "~120,000 in UAE", advisory: "LEAVE IF YOU CAN", color: "#ef4444",
    detail: "Register presence for direct FCDO updates. First evacuation charter from Oman landed Mar 6 after 24h delay. More charters planned. UK allowing bases for 'defensive' strikes.",
    hotline: "+44 1908 516666", action: "Register at gov.uk. Charter flights from Muscat.",
    url: "https://www.cnn.com/2026/03/04/travel/travel-advisories-middle-east-air-disruptions" },
  { country: "India", flag: "🇮🇳", pop: "~3.5 million in UAE", advisory: "SHELTER / EVACUATE", color: "#f59e0b",
    detail: "Developing evacuation operations. 3 Indian nationals killed in Strait of Hormuz. Pakistan sourced 99% LNG from Qatar/UAE — supply crisis affects subcontinent. Embassy coordinating with UAE authorities.",
    hotline: "Indian Embassy Abu Dhabi: +971-2-4492700", action: "Register with embassy. Monitor MEA advisories.",
    url: "" },
  { country: "Pakistan", flag: "🇵🇰", pop: "~1.7 million in UAE", advisory: "SHELTER / STAY ALERT", color: "#f59e0b",
    detail: "Pakistani national killed in UAE (first casualty). UAE announced visa fine exemptions for Pakistanis affected by airspace closures. Embassy coordinating. Protests at US consulate in Karachi (10 killed).",
    hotline: "Pakistan Embassy: +971-2-4447800", action: "Contact UAE immigration to regularize overstay status.",
    url: "" },
  { country: "Bangladesh", flag: "🇧🇩", pop: "~1 million in UAE", advisory: "SHELTER / STAY ALERT", color: "#f59e0b",
    detail: "Bangladeshi national killed in UAE. Another killed in Bahrain. Embassy coordinating shelter and potential evacuation.",
    hotline: "Bangladesh Embassy: +971-2-6344700", action: "Register with embassy.",
    url: "" },
  { country: "Philippines", flag: "🇵🇭", pop: "~700,000 in UAE", advisory: "SHELTER IN PLACE", color: "#f59e0b",
    detail: "Filipino woman killed in Israel by shrapnel. Government urging citizens to shelter in place across Gulf. Making evacuation/repatriation plans.",
    hotline: "Philippine Embassy: +971-2-6343002", action: "Register at DFA. Follow shelter-in-place.",
    url: "https://www.nbcnews.com/world/middle-east/live-blog/live-updates-iran-war-israel-us-hezbollah-lebanon-khamenei-trump-rcna261259" },
  { country: "Nepal", flag: "🇳🇵", pop: "~300,000 in UAE", advisory: "SHELTER / STAY ALERT", color: "#f59e0b",
    detail: "Nepali national killed in UAE (among first casualties). Embassy coordinating with UAE authorities.",
    hotline: "Nepal Embassy: +971-2-6322324", action: "Register with embassy.",
    url: "" },
  { country: "France", flag: "🇫🇷", pop: "~30,000 in UAE", advisory: "LEAVE / CAUTION", color: "#f59e0b",
    detail: "French base Camp de la Paix in Abu Dhabi struck by drones. Deployed Rafale jets for protection. EU arranging repatriation flights. At least 6 flights via European Commission.",
    hotline: "French Embassy: +971-2-4435100", action: "Register at Ariane (MEAE). EU repatriation flights from Oman.",
    url: "https://www.cnn.com/2026/03/04/travel/travel-advisories-middle-east-air-disruptions" },
  { country: "Spain", flag: "🇪🇸", pop: "~15,000 in UAE", advisory: "LEAVE / CAUTION", color: "#f59e0b",
    detail: "PM Sanchez condemned US-Israel strikes as breach of international law. EU repatriation flights available. Spanish Embassy coordinating.",
    hotline: "Spanish Embassy: +971-2-6266544", action: "Register at Registro de Viajeros (MAEC).",
    url: "" },
  { country: "Russia", flag: "🇷🇺", pop: "~50,000 in UAE", advisory: "MONITOR / CAUTION", color: "#f59e0b",
    detail: "Rosatom evacuated staff from Bushehr nuclear plant. Azerbaijan & Armenia receiving refugees from Iran (1,500+ by Mar 6). Reports Russia providing Iran intelligence on US positions (denied by White House).",
    hotline: "Russian Embassy: +971-2-6721797", action: "Monitor embassy channels.",
    url: "" },
  { country: "Australia", flag: "🇦🇺", pop: "~25,000 in UAE", advisory: "LEAVE / DO NOT TRAVEL", color: "#ef4444",
    detail: "Emergency portal opened for citizens in UAE, Qatar, Israel, Iran. Camp Baird at Al Minhad AB in Dubai directly attacked. 4 evacuation flights departed, 4 more planned. Do not travel to most Middle East destinations.",
    hotline: "Consular Emergency: +61 2 6261 3305", action: "Register at smartraveller.gov.au. Evacuation via Oman.",
    url: "https://www.cnn.com/2026/03/04/travel/travel-advisories-middle-east-air-disruptions" },
  { country: "Canada", flag: "🇨🇦", pop: "~40,000 in UAE", advisory: "LEAVE ASAP", color: "#ef4444",
    detail: "Advising to 'leave the UAE as soon as you can secure a flight.' Avoid all travel to Bahrain, Iraq, Israel, Kuwait, Lebanon, Qatar, UAE.",
    hotline: "+1-613-996-8885 (collect)", action: "Register at Registration of Canadians Abroad.",
    url: "https://www.cnn.com/2026/03/04/travel/travel-advisories-middle-east-air-disruptions" },
  { country: "China", flag: "🇨🇳", pop: "~200,000 in UAE", advisory: "EVACUATE", color: "#ef4444",
    detail: "Developing evacuation operations alongside Japan, S. Korea, Indonesia. Chinese national killed in Iran. Significant commercial interests in Gulf.",
    hotline: "Chinese Embassy: +971-2-4434276", action: "Follow embassy WeChat channel.",
    url: "" },
];

// ── DIPLOMATIC TRACKER ──
const DIPLO = {
  timeline: { start: "Feb 28", weeks: 4, daysPassed: 9, daysLeft: 19 },
  status: "ACTIVE COMBAT — NO CEASEFIRE",
  tracks: [
    { ch: "US-Iran", s: "stalled", d: "Trump accepted talks proposal (Mar 1) but set 4-week timetable. Larijani: 'we will not negotiate.' No active dialogue confirmed.", src: "CNBC / AP" },
    { ch: "Oman mediation", s: "dormant", d: "Key mediator in Feb nuclear talks. Only GCC country not struck. Positioned as neutral but no mediation since war began.", src: "Al Jazeera" },
    { ch: "E3 (UK/FR/DE)", s: "active", d: "Backing 'proportionate defensive measures.' UK bases offered. France deployed Rafales. Calling for restraint.", src: "BBC / Reuters" },
    { ch: "Gulf-Iran", s: "fractured", d: "Saudi warns of military response. UAE recalled ambassador. Qatar arrested IRGC cells. Years of rapprochement destroyed.", src: "Reuters" },
    { ch: "UN Security Council", s: "blocked", d: "UN declared humanitarian emergency (Mar 6). Russia/China expected to block force resolution. No ceasefire resolution tabled.", src: "UN / Wikipedia" },
    { ch: "Iran internal", s: "crisis", d: "Khamenei dead. Interim Council formed. Clerics selecting new leader (Mojtaba Khamenei frontrunner). Pezeshkian vs IRGC power struggle.", src: "NYT / Iranian media" },
  ],
  demands: [
    { side: "US / Israel", color: "#60a5fa", items: "Dismantle nuclear program. Regime change. Destroy missile capability." },
    { side: "Iran", color: "#f87171", items: "Stop attacks. Lift sanctions. No regime change interference." },
    { side: "Gulf States", color: "#fbbf24", items: "Immediate ceasefire on Gulf territory. Iranian accountability. Secure shipping lanes." },
  ],
};

const fmt = n => n == null ? "—" : n.toLocaleString();
const evColor = { defense: "#22c55e", attack: "#ef4444", casualty: "#dc2626", alert: "#f59e0b", political: "#a78bfa", civil: "#60a5fa", economic: "#eab308" };
const sideColor = { gulf: "#fbbf24", iran: "#f87171", us: "#60a5fa" };
const stColor = { stable: "#22c55e", partial: "#f59e0b", caution: "#f59e0b", warning: "#ef4444" };

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: color,
      background: color + "14", border: `1px solid ${color}30`,
      padding: "2px 7px", borderRadius: 3,
    }}>
      {label}
    </span>
  );
}

function BarChart({ label, hit, total, color }) {
  if (!total) return null;
  const pct = (hit / total) * 100;
  const miss = total - hit;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: "#6b7585" }}>{label}</span>
        <span>
          <span style={{ color: "#a0a8b4" }}>{fmt(hit)}</span>
          <span style={{ color: "#3d4755" }}> / {fmt(total)} </span>
          <span style={{ color: pct > 95 ? "#22c55e" : pct > 85 ? "#f59e0b" : "#ef4444", fontWeight: 700 }}>
            {pct.toFixed(1)}%
          </span>
        </span>
      </div>
      <div style={{ height: 7, background: "rgba(255,255,255,0.04)", borderRadius: 4, display: "flex", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 4 }} />
        {miss > 0 && <div style={{ width: `${(miss / total) * 100}%`, background: "#ef4444", opacity: 0.5 }} />}
      </div>
      {miss > 0 && <div style={{ fontSize: 9, color: "#ef4444", marginTop: 2 }}>{miss} got through</div>}
    </div>
  );
}

function EscalationMeter({ liveEsc }) {
  const curr = liveEsc?.score ? liveEsc : ESC[ESC.length - 1];
  const prev = ESC[ESC.length - 2];
  const trend = liveEsc?.trend ? liveEsc.trend.toUpperCase() : (curr.s || curr.score) > prev.s ? "ESCALATING" : (curr.s || curr.score) < prev.s ? "DE-ESCALATING" : "STABLE";
  const score = curr.score || curr.s;
  const tc = trend === "ESCALATING" ? "#ef4444" : trend === "DE-ESCALATING" ? "#22c55e" : "#f59e0b";
  const arrow = trend === "ESCALATING" ? "↑" : trend === "DE-ESCALATING" ? "↓" : "→";
  const note = liveEsc?.reason || curr.note;

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 9, color: "#4a5565", letterSpacing: "0.1em", fontWeight: 700 }}>ESCALATION INDEX</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: tc, fontFamily: HD }}>{score}</span>
            <span style={{ fontSize: 11, color: "#4a5565" }}>/100</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: tc }}>{arrow}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: tc, letterSpacing: "0.05em" }}>{trend}</div>
          <div style={{ fontSize: 9, color: "#3d4755" }}>{note}</div>
        </div>
      </div>
      {/* Sparkline */}
      <svg viewBox="0 0 200 40" style={{ width: "100%", display: "block" }}>
        <rect x="0" y="0" width="200" height="8" fill="rgba(239,68,68,0.06)" rx="1" />
        <rect x="0" y="8" width="200" height="12" fill="rgba(245,158,11,0.04)" rx="1" />
        <text x="2" y="6" fill="#ef444444" fontSize="4" fontFamily={MONO}>CRITICAL</text>
        <text x="2" y="17" fill="#f59e0b33" fontSize="4" fontFamily={MONO}>HIGH</text>
        {ESC.map((e, i) => {
          const x = (i / (ESC.length - 1)) * 200;
          const y = 40 - (e.s / 100) * 40;
          return (
            <g key={i}>
              {i > 0 && (
                <line
                  x1={((i - 1) / (ESC.length - 1)) * 200}
                  y1={40 - (ESC[i - 1].s / 100) * 40}
                  x2={x} y2={y}
                  stroke={tc} strokeWidth="1.5"
                />
              )}
              <circle cx={x} cy={y} r={i === ESC.length - 1 ? 3 : 1.5}
                fill={i === ESC.length - 1 ? tc : "#4a5565"} />
              <text x={x} y="38" textAnchor="middle" fill="#3d4755" fontSize="3.5" fontFamily={MONO}>
                {e.d}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function OilSparkline() {
  const h = 50, w = 240;
  const prices = OIL.map(o => o.b);
  const mn = Math.min(...prices) - 3, mx = Math.max(...prices) + 3;
  const pts = OIL.map((o, i) => ({
    x: (i / (OIL.length - 1)) * w,
    y: h - ((o.b - mn) / (mx - mn)) * h,
  }));
  const line = pts.map(p => `${p.x},${p.y}`).join(" ");
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`-5 -10 ${w + 20} ${h + 22}`} style={{ width: "100%", maxWidth: 340, display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="oilG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${line} ${w},${h} 0,${h}`} fill="url(#oilG)" />
      <polyline points={line} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" />
      {OIL.map((o, i) => o.e && (
        <g key={i}>
          <circle cx={pts[i].x} cy={pts[i].y} r="2.5" fill="#ef4444" />
          <text x={pts[i].x} y={pts[i].y - 5} fill="#ef4444" fontSize="5.5" textAnchor="middle" fontFamily={MONO}>{o.e}</text>
        </g>
      ))}
      <circle cx={last.x} cy={last.y} r="4" fill="#0a0e18" stroke="#ef4444" strokeWidth="2" />
      <text x={last.x - 3} y={last.y - 8} fill="#ef4444" fontSize="8" fontWeight="800" textAnchor="end" fontFamily={MONO}>${OIL[OIL.length - 1].b}</text>
      {OIL.map((o, i) => (i % 2 === 0 || i === OIL.length - 1) && (
        <text key={i} x={pts[i].x} y={h + 10} fill="#3d4755" fontSize="5" textAnchor="middle" fontFamily={MONO}>{o.d}</text>
      ))}
    </svg>
  );
}

// ═══ MAIN ═══
export default function App() {
  const [tab, setTab] = useState("overview");
  const [expDef, setExpDef] = useState(null);
  const [expQA, setExpQA] = useState(null);
  const [showAllEv, setShowAllEv] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(LAST_UPDATED);
  const [liveData, setLiveData] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshError(null);
    try {
      const res = await fetch("/api/update");
      const json = await res.json();
      if (json.success && json.data) {
        setLiveData(json.data);
        setLastRefresh(new Date().toLocaleString("en-GB", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai"
        }) + " GST");
      } else {
        setRefreshError("Update returned no data. Using cached data.");
      }
    } catch (err) {
      setRefreshError("Could not fetch update. Using cached data.");
    }
    setRefreshing(false);
  }, []);

  const tabs = [
    { id: "overview", l: "OVERVIEW" },
    { id: "emirates", l: "BUSINESS" },
    { id: "defense", l: "DEFENSE" },
    { id: "events", l: "EVENTS" },
    { id: "oil", l: "OIL" },
    { id: "voices", l: "VOICES" },
    { id: "embassy", l: "EMBASSY" },
    { id: "diplo", l: "DIPLOMACY" },
  ];

  // ── Merge live data with static defaults ──
  const ld = liveData; // shorthand

  const liveUae = ld?.uae || {};
  const liveOil = ld?.oil || {};
  const liveHormuz = ld?.hormuz || {};
  const liveAirports = ld?.airports || {};
  const liveEsc = ld?.escalation_assessment || {};
  const liveEvents = ld?.latest_events || [];

  // Compute header stats from live data if available
  const statMissiles = ld
    ? fmt((liveUae.ballistic_detected || 0) + (ld.qatar?.ballistic_detected || 0) + (ld.bahrain?.ballistic_detected || 0) + (ld.kuwait?.ballistic_detected || 0))
    : "462";
  const statDrones = ld
    ? fmt((liveUae.drones_detected || 0) + (ld.qatar?.drones_detected || 0) + (ld.bahrain?.drones_detected || 0) + (ld.kuwait?.drones_detected || 0))
    : "1,780";
  const statDead = ld
    ? String((liveUae.dead || 0) + (ld.qatar?.dead || 0) + (ld.bahrain?.dead || 0) + (ld.kuwait?.dead || 0) + (ld.saudi?.dead || 0))
    : String(DEF.reduce((s, c) => s + c.dead, 0));
  const statBrent = ld ? `$${liveOil.brent || "92.69"}` : "$92.69";
  const statHormuz = ld
    ? (liveHormuz.status === "closed" ? "SHUT" : liveHormuz.status === "limited" ? "LIMITED" : liveHormuz.status?.toUpperCase() || "SHUT")
    : "SHUT";

  // Merge events: live events first, then static
  const allEvents = liveEvents.length > 0
    ? [...liveEvents.map(e => ({ t: e.time, h: e.title, s: e.source, tp: e.type, hot: true, url: e.url || "" })), ...EV]
    : EV;

  const totalDead = DEF.reduce((s, c) => s + c.dead, 0);

  return (
    <div style={{ fontFamily: MONO, background: "#0a0e18", color: "#a0a8b8", minHeight: "100vh", maxWidth: 900, margin: "0 auto", padding: "0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes glow{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0e18}
        button{transition:opacity .15s}button:active{opacity:.7}
        @media(min-width:640px){
          .grw-header-stats{grid-template-columns:repeat(5,1fr)!important;gap:8px!important}
          .grw-header-stats>div{padding:10px 8px!important}
          .grw-header-stats>div>div:last-child{font-size:20px!important}
          .grw-main{padding:20px 28px!important}
          .grw-tabs{padding:0 28px!important}
          .grw-header{padding:18px 28px 14px!important}
          .grw-share{padding:10px 28px!important}
          .grw-cta{padding:20px 28px!important}
          .grw-footer{padding:16px 28px!important}
          h1{font-size:24px!important}
        }
        @media(min-width:768px){
          .grw-defense-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
          .grw-emirate-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
          .grw-embassy-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
          .grw-events-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
          .grw-biz-items{display:grid;grid-template-columns:1fr 1fr;gap:6px}
        }
      `}</style>

      {/* HEADER */}
      <header className="grw-header" style={{ borderBottom: "1px solid rgba(239,68,68,0.1)", padding: "14px 16px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "glow 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 8, color: "#ef4444", fontWeight: 700, letterSpacing: "0.2em" }}>LIVE · DAY {DAY}</span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#edf0f5", fontFamily: HD }}>Gulf Resident Watch</h1>
            <div style={{ fontSize: 9, color: "#3d4755", marginTop: 1 }}>Iran War Impact Dashboard · Verified Sources</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <button onClick={handleRefresh} disabled={refreshing} style={{
              background: refreshing ? "rgba(255,255,255,0.02)" : "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)", borderRadius: 5,
              color: "#ef4444", fontSize: 9, fontWeight: 700, padding: "5px 10px",
              cursor: refreshing ? "wait" : "pointer", fontFamily: MONO, marginBottom: 3,
            }}>
              {refreshing ? "Updating..." : "↻ Live Update"}
            </button>
            <div style={{ fontSize: 7, color: "#2d3745" }}>{lastRefresh}</div>
            {refreshError && <div style={{ fontSize: 7, color: "#f59e0b", marginTop: 2 }}>{refreshError}</div>}
            {liveData && <div style={{ fontSize: 7, color: "#22c55e", marginTop: 2 }}>Live data active</div>}
          </div>
        </div>
        <div className="grw-header-stats" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4, marginTop: 10 }}>
          {[
            { l: "MISSILES", v: statMissiles, c: "#ef4444" },
            { l: "DRONES", v: statDrones, c: "#f97316" },
            { l: "KILLED", v: statDead, c: "#ef4444" },
            { l: "BRENT", v: statBrent, c: "#ef4444" },
            { l: "HORMUZ", v: statHormuz, c: "#ef4444" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 5, padding: "5px 2px", textAlign: "center" }}>
              <div style={{ fontSize: 6, color: "#4a5565", letterSpacing: "0.1em" }}>{s.l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.c, fontFamily: HD }}>{s.v}</div>
            </div>
          ))}
        </div>
      </header>

      {/* SHARE */}
      <div className="grw-share" style={{ padding: "8px 16px", display: "flex", gap: 6 }}>
        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Gulf Resident Watch Day ${DAY}: UAE 1,305 drones / 221 missiles. Brent $92.69. Hormuz closed. Dubai limited flights, Doha closed, Muscat open. gulfresidentwatch.com`)}`, "_blank")} style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 5, padding: "6px 12px", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: MONO }}>
          WhatsApp
        </button>
        <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Gulf Resident Watch Day ${DAY}: 1,305 drones / 221 missiles on UAE. Brent $92.69. Hormuz closed. Verified MoD data → gulfresidentwatch.com`)}`, "_blank")} style={{ background: "#1DA1F2", color: "#fff", border: "none", borderRadius: 5, padding: "6px 12px", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: MONO }}>
          Twitter
        </button>
      </div>

      {/* TABS */}
      <nav className="grw-tabs" style={{ display: "flex", overflowX: "auto", padding: "0 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "7px 10px",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", fontFamily: MONO,
            color: tab === t.id ? "#ef4444" : "#3d4755",
            borderBottom: tab === t.id ? "2px solid #ef4444" : "2px solid transparent",
          }}>{t.l}</button>
        ))}
      </nav>

      <main className="grw-main" style={{ padding: "14px 16px", animation: "fadeIn .25s ease" }}>

        {/* ═══ OVERVIEW ═══ */}
        {tab === "overview" && (
          <div>
            {liveData && (
              <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 6, padding: "8px 12px", marginBottom: 10, fontSize: 10, color: "#22c55e", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                Live data active — last fetched {lastRefresh}
              </div>
            )}
            <EscalationMeter liveEsc={liveEsc} />

            {/* Hormuz alert */}
            <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 7, padding: "9px 12px", marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "glow 2s infinite", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444" }}>STRAIT OF HORMUZ — {liveHormuz.status ? liveHormuz.status.toUpperCase() : "EFFECTIVELY CLOSED"}</div>
                <div style={{ fontSize: 9, color: "#5a6575" }}>{liveHormuz.detail || "4 transits/24h · 150+ ships stuck · Insurance withdrawn · 20% of global crude"}</div>
              </div>
            </div>

            {/* How does this affect me */}
            <div style={{ fontSize: 15, fontWeight: 700, color: "#edf0f5", fontFamily: HD, marginBottom: 8 }}>How does this affect me?</div>
            {QA.map((item, i) => (
              <div key={i} onClick={() => setExpQA(expQA === i ? null : i)} style={{
                background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 6, padding: "10px 12px", marginBottom: 5, cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#edf0f5", fontFamily: HD }}>{item.q}</span>
                  </div>
                  <Badge label={item.status.toUpperCase()} color={stColor[item.status] || "#f59e0b"} />
                </div>
                {expQA === i && (
                  <div style={{ fontSize: 11, color: "#7a8595", marginTop: 8, lineHeight: 1.6, paddingLeft: 24 }}>{item.a}</div>
                )}
              </div>
            ))}

            {/* Iran rift */}
            <div style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: 7, padding: "10px 12px", marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 3 }}>IRAN COMMAND CRISIS</div>
              <div style={{ fontSize: 10, color: "#6b7585", lineHeight: 1.6 }}>President Pezeshkian ordered strikes on Gulf to stop. Hours later, IRGC and Speaker Ghalibaf overruled him — attacks on Dubai continued. BBC and Reuters describe this as an unprecedented breakdown in unified command.</div>
              <div style={{ fontSize: 8, color: "#333d4d", marginTop: 3, fontStyle: "italic" }}>Sources: BBC, Reuters, WAM, Iranian state media</div>
            </div>
          </div>
        )}

        {/* ═══ BY EMIRATE ═══ */}
        {tab === "emirates" && (
          <div>
            <div style={{ fontSize: 10, color: "#4a5565", marginBottom: 12 }}>
              Operational status for businesses in the Gulf. Updated from official sources, Bloomberg, CNBC, Lloyd's.
            </div>
            {BIZ_OPS.map((section, si) => (
              <div key={si} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${section.color}20` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: section.color }}>{section.cat}</span>
                  <Badge label={section.status === "critical" ? "CRITICAL" : section.status === "partial" ? "DISRUPTED" : "CAUTION"} color={section.color} />
                </div>
                {section.items.map((item, ii) => (
                  <div key={ii} style={{
                    background: "rgba(255,255,255,0.012)", borderRadius: 5,
                    padding: "7px 10px", marginBottom: 4,
                    borderLeft: `2px solid ${section.color}40`,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#dde1e8", fontFamily: HD }}>{item.what}</div>
                    <div style={{ fontSize: 10, color: "#6b7585", lineHeight: 1.5, marginTop: 2 }}>{item.detail}</div>
                    <div style={{ fontSize: 8, color: "#333d4d", marginTop: 3 }}>
                      via {item.src}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                          style={{ color: "#60a5fa", textDecoration: "none", marginLeft: 6, borderBottom: "1px solid #60a5fa33" }}>
                          source ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ fontSize: 9, color: "#333d4d", marginTop: 4, lineHeight: 1.5, fontStyle: "italic" }}>
              Sources: Bloomberg, CNBC, Lloyd's List, UKMTO, QatarEnergy, Reuters, Gulf News, digitaldubai.ai, The Business Year, US State Dept, DFSA.
            </div>
          </div>
        )}

        {/* ═══ DEFENSE ═══ */}
        {tab === "defense" && (
          <div>
            <div style={{ fontSize: 10, color: "#4a5565", marginBottom: 10 }}>Official interception figures. Tap for breakdown.</div>
            {DEF.map((c, i) => {
              const isExp = expDef === i;
              return (
                <div key={i} onClick={() => setExpDef(isExp ? null : i)} style={{
                  background: isExp ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.01)",
                  border: `1px solid ${isExp ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.03)"}`,
                  borderRadius: 7, padding: "10px 12px", marginBottom: 6, cursor: "pointer",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span style={{ fontSize: 20 }}>{c.f}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#edf0f5", fontFamily: HD }}>{c.c}</div>
                        <div style={{ fontSize: 9, color: "#3d4755" }}>
                          {c.bm ? `${fmt(c.bm[0] + c.dr[0] + c.cr[0])} projectiles` : "Limited disclosure"}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {c.dead > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{c.dead} killed</div>}
                      {c.inj > 0 && <div style={{ fontSize: 10, color: "#f59e0b" }}>{c.inj} injured</div>}
                    </div>
                  </div>
                  {isExp && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      {c.bm && <BarChart label="BALLISTIC MISSILES" hit={c.bm[1] + c.bm[2]} total={c.bm[0]} color="#60a5fa" />}
                      {c.dr && <BarChart label="DRONES (UAV)" hit={c.dr[1]} total={c.dr[0]} color="#22c55e" />}
                      {c.cr[0] > 0 && <BarChart label="CRUISE MISSILES" hit={c.cr[1]} total={c.cr[0]} color="#a78bfa" />}
                      {c.who && <div style={{ fontSize: 9, color: "#6b7585", marginTop: 4 }}>Victims: {c.who}</div>}
                      {c.note && <div style={{ fontSize: 9, color: "#f59e0b", marginTop: 6, background: "rgba(245,158,11,0.06)", padding: "5px 8px", borderRadius: 4 }}>{c.note}</div>}
                      <div style={{ fontSize: 8, color: "#333d4d", marginTop: 5, fontStyle: "italic" }}>Source: {c.src} · {c.dt}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ EVENTS ═══ */}
        {tab === "events" && (
          <div>
            <div style={{ fontSize: 10, color: "#4a5565", marginBottom: 10 }}>Last 48 hours. Most recent first.</div>
            {(showAllEv ? allEvents : allEvents.slice(0, 8)).map((ev, i) => {
              const cl = evColor[ev.tp] || "#6b7585";
              return (
                <div key={i} style={{
                  borderLeft: `2px solid ${cl}`, padding: "7px 10px", marginBottom: 4,
                  background: ev.hot ? "rgba(255,255,255,0.015)" : "transparent",
                  borderRadius: "0 5px 5px 0",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontSize: 7, fontWeight: 700, color: cl, letterSpacing: "0.1em", textTransform: "uppercase" }}>{ev.tp}</span>
                    <span style={{ fontSize: 8, color: "#333d4d" }}>{ev.t}</span>
                  </div>
                  <div style={{ fontSize: 11, color: ev.hot ? "#dde1e8" : "#6b7585", fontWeight: ev.hot ? 600 : 400, lineHeight: 1.4 }}>{ev.h}</div>
                  <div style={{ fontSize: 8, color: "#2d3745", marginTop: 2 }}>
                    via {ev.s}
                    {ev.url && (
                      <a href={ev.url} target="_blank" rel="noopener noreferrer"
                        style={{ color: "#60a5fa", textDecoration: "none", marginLeft: 6, borderBottom: "1px solid #60a5fa33" }}>
                        source ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            {!showAllEv && allEvents.length > 8 && (
              <button onClick={() => setShowAllEv(true)} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 5, padding: "7px", fontSize: 9, color: "#4a5565",
                cursor: "pointer", fontFamily: MONO, width: "100%", marginTop: 4,
              }}>Show all {allEvents.length} events</button>
            )}
          </div>
        )}

        {/* ═══ OIL ═══ */}
        {tab === "oil" && (
          <div>
            <div style={{ fontSize: 8, color: "#4a5565", letterSpacing: "0.1em" }}>BRENT CRUDE OIL</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#ef4444", fontFamily: HD }}>$92.69</div>
            <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 2 }}>+35.6% weekly — largest gain in futures history</div>
            <div style={{ fontSize: 8, color: "#333d4d", fontStyle: "italic", marginBottom: 14 }}>Source: CNBC, OilPrice.com · 7 Mar close</div>
            <OilSparkline />
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#5a6575", marginTop: 16, marginBottom: 6, paddingBottom: 3, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>SUPPLY DISRUPTIONS</div>
            {[
              ["Strait of Hormuz", "Near-zero traffic", "c"], ["Iraq output", "−1.5M bbl/day", "c"],
              ["Kuwait output", "Cutting production", "w"], ["Qatar LNG", "Force Majeure", "c"],
              ["EU natural gas", "+50% surge", "c"], ["Shipping insurance", "Withdrawn", "c"],
              ["Goldman forecast", ">$100 next week", "w"], ["US gasoline", "+$0.27/gal in 7d", "w"],
            ].map(([l, v, s], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                <span style={{ fontSize: 10, color: "#6b7585" }}>{l}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: s === "c" ? "#ef4444" : "#f59e0b" }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* ═══ VOICES ═══ */}
        {tab === "voices" && (
          <div>
            <div style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.12)", borderRadius: 6, padding: "9px 11px", marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa" }}>IRAN COMMAND CRISIS</div>
              <div style={{ fontSize: 9, color: "#5a6575", lineHeight: 1.5, marginTop: 2 }}>Pezeshkian ordered strikes to stop. IRGC overruled him. Attacks continued on Dubai. Unprecedented breakdown in command.</div>
            </div>
            {[
              { label: "GULF STATES", side: "gulf" },
              { label: "IRAN", side: "iran" },
              { label: "US / ISRAEL", side: "us" },
            ].map(group => (
              <div key={group.side} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: sideColor[group.side], marginBottom: 5, paddingBottom: 3, borderBottom: `1px solid ${sideColor[group.side]}18` }}>{group.label}</div>
                {STMT.filter(s => s.side === group.side).map((s, i) => (
                  <div key={i} style={{ borderLeft: `2px solid ${sideColor[group.side]}`, padding: "7px 10px", marginBottom: 4, borderRadius: "0 5px 5px 0", background: sideColor[group.side] + "06" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{s.flag}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#edf0f5" }}>{s.who}</span>
                        <span style={{ fontSize: 8, color: "#3d4755" }}>{s.role}</span>
                      </div>
                      <span style={{ fontSize: 7, color: "#2d3745" }}>{s.d}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#8a94a5", fontStyle: "italic", lineHeight: 1.45 }}>"{s.q}"</div>
                    <div style={{ fontSize: 7, color: "#2d3745", marginTop: 2 }}>via {s.via}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ═══ YOUR EMBASSY ═══ */}
        {tab === "embassy" && (
          <div>
            <div style={{ fontSize: 10, color: "#4a5565", marginBottom: 12 }}>
              Official advisories from embassies with major expat populations in the Gulf. Hotlines, evacuation status, and recommended actions. Over 24 million foreign workers are in the Gulf region.
            </div>
            {EMBASSIES.map((em, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.012)", borderRadius: 6,
                borderLeft: `3px solid ${em.color}`,
                padding: "10px 12px", marginBottom: 7,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{em.flag}</span>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#edf0f5", fontFamily: HD }}>{em.country}</span>
                      <span style={{ fontSize: 9, color: "#4a5565", marginLeft: 6 }}>{em.pop}</span>
                    </div>
                  </div>
                  <Badge label={em.advisory} color={em.color} />
                </div>
                <div style={{ fontSize: 10, color: "#7a8595", lineHeight: 1.55, marginBottom: 4 }}>{em.detail}</div>
                <div style={{ fontSize: 9, color: "#60a5fa", marginBottom: 2 }}>
                  Action: {em.action}
                </div>
                <div style={{ fontSize: 9, color: "#6b7585" }}>
                  Hotline: {em.hotline}
                </div>
                {em.url && (
                  <a href={em.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 8, color: "#60a5fa", textDecoration: "none", borderBottom: "1px solid #60a5fa33", marginTop: 4, display: "inline-block" }}>
                    Official advisory ↗
                  </a>
                )}
              </div>
            ))}
            <div style={{ fontSize: 9, color: "#333d4d", marginTop: 8, lineHeight: 1.5, fontStyle: "italic" }}>
              Sources: US State Dept, UK FCDO, CNN, NBC News, Gulf News, Wikipedia, individual embassy statements. Population estimates approximate. Hotlines may be overloaded — try multiple times.
            </div>
          </div>
        )}

        {/* ═══ DIPLOMACY ═══ */}
        {tab === "diplo" && (
          <div>
            {/* Timeline countdown */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: "#4a5565", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6 }}>TRUMP'S 4-WEEK TIMETABLE</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", fontFamily: HD }}>{DIPLO.timeline.daysLeft}</span>
                  <span style={{ fontSize: 11, color: "#4a5565", marginLeft: 4 }}>days remaining</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444" }}>{DIPLO.status}</div>
                  <div style={{ fontSize: 9, color: "#4a5565" }}>Day {DIPLO.timeline.daysPassed} of ~28</div>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${(DIPLO.timeline.daysPassed / 28) * 100}%`, height: "100%", background: "linear-gradient(90deg, #ef4444, #f59e0b)", borderRadius: 4 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#3d4755", marginTop: 3 }}>
                <span>Feb 28 — War begins</span>
                <span>~Mar 28 — Trump's deadline</span>
              </div>
            </div>

            {/* Negotiation channels */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#6b7585", marginBottom: 8 }}>NEGOTIATION CHANNELS</div>
            {DIPLO.tracks.map((t, i) => {
              const sc = { stalled: "#ef4444", dormant: "#4a5565", active: "#22c55e", fractured: "#f59e0b", blocked: "#ef4444", crisis: "#a78bfa" };
              return (
                <div key={i} style={{ borderLeft: `2px solid ${sc[t.s] || "#4a5565"}`, padding: "7px 10px", marginBottom: 5, borderRadius: "0 5px 5px 0", background: `${sc[t.s] || "#4a5565"}06` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#edf0f5", fontFamily: HD }}>{t.ch}</span>
                    <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.12em", color: sc[t.s], background: `${sc[t.s]}14`, border: `1px solid ${sc[t.s]}30`, padding: "2px 6px", borderRadius: 3 }}>
                      {t.s.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "#7a8595", lineHeight: 1.5 }}>{t.d}</div>
                  <div style={{ fontSize: 8, color: "#333d4d", marginTop: 2 }}>via {t.src}</div>
                </div>
              );
            })}

            {/* Ceasefire demands */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#6b7585", marginTop: 14, marginBottom: 8 }}>CEASEFIRE CONDITIONS (each side)</div>
            {DIPLO.demands.map((d, i) => (
              <div key={i} style={{ borderLeft: `2px solid ${d.color}`, padding: "7px 10px", marginBottom: 5, borderRadius: "0 5px 5px 0" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.side}</div>
                <div style={{ fontSize: 10, color: "#7a8595", lineHeight: 1.5, marginTop: 2 }}>{d.items}</div>
              </div>
            ))}

            <div style={{ fontSize: 9, color: "#333d4d", marginTop: 10, lineHeight: 1.5, fontStyle: "italic" }}>
              Assessment based on public statements and verified reporting. Actual diplomatic back-channels may exist that are not publicly known.
            </div>
          </div>
        )}
      </main>

      {/* ═══ EMAIL CAPTURE ═══ */}
      <div className="grw-cta" style={{ padding: "16px", background: "rgba(96,165,250,0.04)", borderTop: "1px solid rgba(96,165,250,0.1)", borderBottom: "1px solid rgba(96,165,250,0.1)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#edf0f5", fontFamily: HD, marginBottom: 3 }}>Get Daily Alerts</div>
        <div style={{ fontSize: 10, color: "#6b7585", marginBottom: 10 }}>Gulf Crisis Briefing — verified data, delivered to your inbox every morning at 6am GST.</div>
        <a
          href="https://substack.com/@josebawariboperez"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block", textAlign: "center", textDecoration: "none",
            background: "#60a5fa", color: "#0a0e18", border: "none", borderRadius: 5,
            padding: "10px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: MONO,
          }}
        >
          Subscribe on Substack — Free
        </a>
        <div style={{ fontSize: 8, color: "#3d4755", marginTop: 6 }}>Free during the conflict. No spam. Unsubscribe anytime.</div>
      </div>

      <footer className="grw-footer" style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: "#3d4755" }}>gulfresidentwatch.com</div>
        <div style={{ fontSize: 7, color: "#1d2535", lineHeight: 1.5, marginTop: 3 }}>
          Sources: UAE MoD (WAM), Qatar MoD, BDF, Kuwait MoD, Saudi MoD, CENTCOM, UKMTO, Lloyd's, Reuters, Al Jazeera, CNBC, Bloomberg, The National, JINSA, Breaking Defense. Verified {LAST_UPDATED}. For informational purposes only.
        </div>
      </footer>
    </div>
  );
}
