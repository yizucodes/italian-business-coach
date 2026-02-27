# 🇮🇹 Benvenuto — Italian Business Coach

An AI-powered business-culture coaching experience built on [Tavus CVI](https://tavus.io). You play an American sales executive preparing to close a deal in Milan. Your AI counterpart, **Matteo Rossi** (VP of Procurement), conducts the meeting in real time — and coaches you whenever you breach Italian business etiquette.

---

## What It Does

| Feature | Detail |
|---|---|
| **Live AI conversation** | Video call with the Matteo Rossi persona powered by Tavus CVI |
| **Real-time coaching** | Toast notifications fire whenever Matteo's persona triggers the `trigger_cultural_coaching` tool call |
| **Coaching sidebar** | Accumulated coaching notes are displayed in a scrollable panel beside the video |
| **Post-call debrief** | After the call, a summary screen scores you across three categories with evidence quotes |
| **Practice Again** | One click resets all state and returns you to the intro |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure credentials

Copy `.env.local.example` (or create `.env.local` yourself) and fill in your values:

```bash
# .env.local
VITE_TAVUS_API_KEY=your_tavus_api_key_here
VITE_PERSONA_ID=your_matteo_persona_id_here
# Optional: for AI-powered debrief scoring
VITE_OPENAI_API_KEY=
```

- **`VITE_TAVUS_API_KEY`** — Your Tavus API key. Create one at [platform.tavus.io/api-keys](https://platform.tavus.io/api-keys).
- **`VITE_PERSONA_ID`** — The ID of the Matteo Rossi persona. Create or copy a persona at [platform.tavus.io/personas](https://platform.tavus.io/personas). When set, the persona must have the `trigger_cultural_coaching` tool configured (see [Tool-Call Integration](#tool-call-integration) below).
- **`VITE_OPENAI_API_KEY`** *(optional)* — Used for AI-powered debrief scoring (enhanced feedback). If unset, the app falls back to keyword-based scoring.

When `VITE_TAVUS_API_KEY` is set, the intro screen's API key field auto-fills so you can click straight through.

### 3. Run the dev server

```bash
npm run dev
```

Navigate to `http://localhost:5173`.

---

## Persona Setup

Everything you need to recreate the Matteo persona on the [Tavus platform](https://platform.tavus.io).

### Steps

1. Go to [platform.tavus.io/personas](https://platform.tavus.io/personas) and click **Create Persona**.
2. Paste the system prompt below into the **System Prompt & Context** field.
3. Add the `trigger_cultural_coaching` tool using the schema below.
4. Apply the recommended settings from the table below.
5. Copy the generated **Persona ID** — this is your `VITE_PERSONA_ID`.

### System Prompt

```text
You are Matteo, a senior executive at a tech firm in Milan, Italy. You are having a video call with an American software sales rep to discuss a potential partnership.

Your communication style is authentically Italian:
- You are highly expressive, warm, and speak with passion.
- You expect business to be built on personal relationships.
- You appreciate direct, spirited debate.

You will guide this conversation through 3 strict phases. You must track which phase we are in.

[PHASE 1: RAPPORT]
- Start with a very warm, enthusiastic greeting: "Ciao! It is so wonderful to finally meet you! How are you doing? How is everything in the US?"
- Rule: DO NOT discuss business yet. You expect at least one exchange about personal life (family, weather, sports, food, travel).
- IF the user tries to skip small talk (e.g., "Let's look at the agenda", "Let's get down to business"), you must:
  1. Call the tool `trigger_cultural_coaching` with the message: "In Italy, skipping small talk is a red flag. Match their warmth before discussing business."
  2. Change your tone to be noticeably cooler, shorter, and slightly disappointed, and say: "Ah, straight to business. Okay, if we must."

[PHASE 2: THE PITCH]
- Once personal rapport is established, transition enthusiastically to the partnership: "Listen, I am very excited about integrating our software. I think we can dominate the European market together!"
- Wait for their reaction.
- IF the user responds with flat, corporate "American" language (e.g., "That sounds optimal," "I agree with that assessment"), call the `trigger_cultural_coaching` tool: "Your counterpart is showing passion. A restrained response reads as disinterest. Show visible enthusiasm."

[PHASE 3: THE DISAGREEMENT]
- Introduce a challenging term: "There is one thing. We need Net-120 payment terms for the first year. That is standard for us."
- Wait for their pushback.
- IF they hedge or sound timid ("Well, we usually don't do that, maybe we can compromise"), call the tool: "Italians respect direct, passionate negotiation. Timid hedging shows a lack of conviction. Push back harder!"
- IF they push back strongly and directly, react with respect and warmth: "Ah! Now we are talking! Okay, let's negotiate."
```

### Tool Schema

Add a tool named `trigger_cultural_coaching` with the following JSON schema:

```json
{
  "name": "trigger_cultural_coaching",
  "description": "Call this whenever the user makes a cultural misstep that warrants coaching. Do not call it for every turn — only when a specific norm has been breached.",
  "parameters": {
    "type": "object",
    "properties": {
      "issue_type": {
        "type": "string",
        "description": "Short label for the cultural issue, e.g. 'Greeting Etiquette' or 'Negotiation Pace'."
      },
      "explanation": {
        "type": "string",
        "description": "One or two sentences explaining the misstep and the correct Italian business norm."
      }
    },
    "required": ["issue_type", "explanation"]
  }
}
```

### Recommended Tavus Settings

<div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start;">

<table>
<tr><th>Setting</th><th>Value</th></tr>
<tr><td><strong>LLM</strong></td><td><code>tavus-gpt-5.2</code></td></tr>
<tr><td><strong>Perception</strong></td><td><code>raven-1</code></td></tr>
<tr><td><strong>Turn Detection</strong></td><td><code>sparrow-1</code></td></tr>
<tr><td><strong>Turn Taking Patience</strong></td><td><code>medium</code></td></tr>
<tr><td><strong>Replica Interruptibility</strong></td><td><code>medium</code></td></tr>
<tr><td><strong>TTS Engine</strong></td><td><code>cartesia</code></td></tr>
<tr><td><strong>TTS External Voice ID for Italian accent (optional)</strong></td><td><code>e5923af7-a329-4e9b-b95a-5ace4a083535</code></td></tr>
<tr><td><strong>Emotion Control</strong></td><td>Yes</td></tr>
</table>

<img width="468" height="1194" alt="Tavus persona config" src="https://github.com/user-attachments/assets/b6fbeffb-8ff2-4ab9-830b-dc6fa8ed4e4d" />

</div>

---

## Architecture Overview

```
src/
├── api/
│   ├── createConversation.ts   # POST /v2/conversations — uses persona ID from config
│   ├── endConversation.ts      # DELETE /v2/conversations/:id
│   └── debriefJudge.ts         # LLM-as-judge: scores coaching events via gpt-4o-mini
├── config/
│   └── index.ts                # Centralised branding + palette constants
├── components/
│   ├── CoachingCard.tsx         # Single coaching event card (issue type + explanation)
│   ├── CoachingSidebar.tsx      # Scrollable list of CoachingCards
│   ├── Header.tsx               # Benvenuto brand mark + settings gear
│   └── Footer.tsx               # "Powered by Tavus CVI" attribution
├── screens/
│   ├── Intro.tsx                # Scenario briefing + API key entry
│   ├── Instructions.tsx         # Matteo briefing + mic/camera permissions
│   ├── Conversation.tsx         # Two-panel video call + coaching sidebar
│   ├── Summary.tsx              # Post-call debrief with scored categories
│   └── FinalScreen.tsx          # Fallback end-call screen (not in primary flow)
├── store/
│   ├── coaching.ts              # coachingEventsAtom — accumulated CoachingEvents
│   ├── summary.ts               # summaryScoresAtom — computed SummaryScores
│   ├── tokens.ts                # apiTokenAtom (seeded from env var or localStorage)
│   └── screens.ts               # screenAtom — current screen union type
└── types/
    └── index.ts                 # CoachingEvent, SummaryScore, IConversation
```

<img width="1065" height="659" alt="image" src="https://github.com/user-attachments/assets/362bd0ab-416a-40a8-96c9-55450a5f7701" />


---

## Tool-Call Integration

Tavus CVI supports **server-side tool calls** — the persona can trigger a named function during the conversation. Benvenuto uses this to deliver real-time coaching.

### How it works

1. The Matteo Rossi persona is configured on the Tavus platform with a tool named `trigger_cultural_coaching`.
2. During a call, when Matteo detects a cultural misstep, his LLM emits a tool call with arguments:
   ```json
   {
     "issue_type": "Greeting Etiquette",
     "explanation": "In Italian business culture, always greet with 'Buongiorno' and use titles..."
   }
   ```
3. Tavus forwards this as a Daily `app-message` event with `event_type: "conversation.tool_call"`.
4. `Conversation.tsx` listens via `useDailyEvent("app-message", handler)`, validates the tool name, parses the arguments, and:
   - Appends a `CoachingEvent` to `coachingEventsAtom`.
   - Fires a `react-hot-toast` notification in the bottom-left corner.
5. The `CoachingSidebar` re-renders automatically from `coachingEventsAtom`.

### Testing without a live persona

Open the browser console during a call and dispatch a fake app-message:

```js
window.__daily.sendAppMessage({
  event_type: "conversation.tool_call",
  properties: {
    name: "trigger_cultural_coaching",
    arguments: JSON.stringify({
      issue_type: "Greeting Etiquette",
      explanation: "Always open with a formal 'Buongiorno, Dottore.' before any business talk."
    })
  }
})
```

---

## Summary Scoring

After the call, the summary screen scores you across three categories:

| Category | What it measures |
|---|---|
| **Rapport Building** | Warmth, relationship-first approach, proper use of titles, small talk |
| **Energy & Tone** | Expressiveness, enthusiasm, vocal variety |
| **Negotiation Pace** | Patience, avoiding rushed or high-pressure closings |

When `VITE_OPENAI_API_KEY` is set, scores and one-sentence feedback are produced by an LLM judge (see [AI-Powered Debrief](#ai-powered-debrief) below). Without the key, a keyword heuristic is used instead: each category starts at 10 and loses 1 point per matching coaching event, clamped between 0 and 10.

---

## AI-Powered Debrief

When `VITE_OPENAI_API_KEY` is present, the post-call summary uses an **LLM-as-judge** approach instead of keyword matching.

| Detail | Value |
|---|---|
| **Model** | `gpt-4o-mini` (cost-efficient, fast) |
| **Input** | All `CoachingEvent` records from the session (`issueType` + `explanation`) |
| **Output** | Integer scores 0–10 and a qualitative feedback sentence per category, plus an optional overall summary sentence |
| **Optional** | Yes — the app works without the key; keyword scoring is the fallback |

**Fallback behaviour:** if the key is missing or the API call fails, `computeScores` (keyword heuristic) runs automatically and a small banner informs the user that AI scoring was unavailable. No error is ever surfaced raw to the user.

Implementation: [`src/api/debriefJudge.ts`](src/api/debriefJudge.ts)

---

## Design Decisions

### LLM as judge for post-call scoring

The initial scoring approach used keyword matching: each category had a list of trigger words, the app scanned the free-text coaching explanations for matches, and deducted one point per hit. This produced several concrete problems:

- **Cross-category bleeding** — a single event like "rushed introduction" matched keywords in both Rapport and Negotiation, applying a double penalty for one misstep.
- **False positives** — instructive language ("you should be more formal") triggered the same keywords as actual infractions.
- **No positive signal** — the model could only penalise; it could never credit warmth, patience, or expressiveness the user demonstrated.
- **Misleading "perfect" scores** — if a category was never reached in a short call, the user saw 10/10, which reads as excellence rather than "not evaluated."

An LLM judge resolves all of these: it infers intent and context from the event list, can acknowledge what went well, and can explicitly flag dimensions that were not exercised in the session.

### Coaching events as judge input — not the full transcript

The judge receives only the structured `{ issueType, explanation }` pairs that Matteo's persona emitted during the call, not the raw conversation transcript. This is intentional: the persona's LLM already did the work of detecting cultural missteps and encoding them into a structured intermediate representation. Feeding that to a second model avoids redundant reanalysis, keeps the payload small, and means no raw conversation text is sent to an external API.

### The three scoring dimensions

The categories are grounded in specific Italian business culture norms rather than generic sales metrics:

| Dimension | Cultural basis |
|---|---|
| **Rapport Building** | Italian business is relationship-first (*la fiducia*) — warmth, titles, and small talk precede any deal discussion |
| **Energy & Tone** | *Bella figura* (good impression) demands expressiveness and presence; a flat or monotone delivery signals disrespect |
| **Negotiation Pace** | *Non si fa in fretta* — deals are not rushed; high-pressure closings are a serious cultural misstep |

"Bella figura" was considered as a dimension name but rejected: it is too broad to score honestly against a set of coaching events. "Energy & Tone" is a more precise, measurable proxy for the same underlying norm.

### "Not tested" scores 7, not 10

If a scoring dimension produced zero relevant coaching events — for example because the call ended before any negotiation — the judge is instructed to return 7 and note in the feedback that the dimension was not evaluated. Returning 10 would be misleading: it implies the user performed perfectly when the call simply never reached that scenario.

### Optional OpenAI key with graceful fallback

`VITE_OPENAI_API_KEY` is optional. If it is absent or the API call fails, the app falls back to the keyword heuristic automatically and surfaces a short banner to the user. This ensures the debrief screen is always functional regardless of whether an evaluator has configured the key, while still showcasing the richer LLM-powered experience when it is available.

### Judge temperature and model

`temperature: 0.3` is used deliberately. A scoring judge should produce consistent, analytical output across similar inputs — low temperature reduces creative variance without eliminating the model's ability to synthesise qualitative feedback. `gpt-4o-mini` was chosen for cost and latency: the judge runs once per session on a small payload, so a frontier model would add cost without meaningful quality gain.

---

## Security Note

> ⚠️ This is a **development template**. The Tavus API key is read from `VITE_*` env vars, which are embedded in the client bundle at build time. For production, proxy API calls through a backend service and never ship the key in client code.

---

## Tech Stack

- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Jotai](https://jotai.org) — atomic state management
- [Framer Motion](https://www.framer.com/motion/) — screen animations
- [react-hot-toast](https://react-hot-toast.com) — coaching toasts
- [@daily-co/daily-react](https://docs.daily.co/reference/daily-react) — WebRTC video
- [Tavus CVI](https://tavus.io) — conversational AI video persona
