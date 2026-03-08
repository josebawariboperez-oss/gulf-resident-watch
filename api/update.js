// api/update.js — Vercel Serverless Function
// Calls Claude API with web search to fetch latest verified MoD data

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
          },
        ],
        messages: [
          {
            role: "user",
            content: `You are a data analyst for Gulf Resident Watch, a conflict impact dashboard for Gulf residents.

Search for the LATEST official data on the Iran war's impact on Gulf states. Prioritize these sources IN ORDER:
1. UAE Ministry of Defence (WAM) — latest intercept figures (ballistic missiles, drones, cruise missiles detected/intercepted)
2. Qatar Ministry of Defence — latest intercept figures
3. Bahrain Defence Force — latest intercept figures  
4. Kuwait Ministry of Defence — latest intercept figures
5. Saudi Ministry of Defence — any new statements
6. Brent crude oil price today
7. Strait of Hormuz shipping status
8. Any new major events in the last 6 hours (strikes, diplomatic developments, civilian impact)
9. Airport status: DXB, AUH, DOH, MCT
10. Any new embassy advisories or evacuation updates

Search for: "UAE ministry of defence missiles drones intercepted today 2026", "Brent crude oil price today", "Strait of Hormuz shipping today", "Dubai airport status today", "Iran war Gulf latest"

Return ONLY valid JSON (no markdown, no backticks, no preamble) in this exact format:
{
  "timestamp": "ISO timestamp of when you searched",
  "uae": {
    "ballistic_detected": number or null,
    "ballistic_destroyed": number or null,
    "drones_detected": number or null,
    "drones_intercepted": number or null,
    "cruise_detected": number or null,
    "cruise_destroyed": number or null,
    "dead": number,
    "injured": number,
    "source": "exact source name",
    "source_date": "date of communique"
  },
  "qatar": { same structure },
  "bahrain": { same structure },
  "kuwait": { same structure },
  "saudi": { same structure or null if no data },
  "oil": {
    "brent": number,
    "change_pct": "string like +2.3%",
    "source": "source name"
  },
  "hormuz": {
    "status": "closed/limited/open",
    "transits_24h": number or null,
    "detail": "brief status"
  },
  "airports": {
    "dxb": "closed/limited/open",
    "auh": "closed/limited/open",
    "doh": "closed/limited/open",
    "mct": "closed/limited/open"
  },
  "latest_events": [
    {
      "time": "timestamp",
      "title": "what happened",
      "source": "source name",
      "type": "defense/attack/political/economic/civil",
      "url": "source url if available"
    }
  ],
  "escalation_assessment": {
    "score": number 0-100,
    "trend": "escalating/stable/de-escalating",
    "reason": "one sentence explanation"
  }
}

IMPORTANT: Return ONLY the JSON object. No other text.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Claude API error: ${err}` });
    }

    const data = await response.json();

    // Extract text content from response (may include tool use blocks)
    const textContent = data.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    // Try to parse JSON from response
    let parsed;
    try {
      const cleaned = textContent.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(200).json({
        raw: textContent,
        parse_error: "Could not parse JSON from Claude response. Raw text included.",
      });
    }

    return res.status(200).json({
      success: true,
      data: parsed,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
