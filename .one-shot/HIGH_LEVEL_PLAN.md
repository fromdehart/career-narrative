# High-Level Plan: AwesomeWork — Career Narrative

## What It Does
AwesomeWork transforms a job seeker's career into a structured, verifiable narrative through a guided audio interview, evidence collection, and optional reference conversations. The resulting profile is simultaneously human-readable (a story page) and machine-readable (a queryable structured profile), designed to be trusted by both human recruiters and AI agents over traditional resumes.

## Key Features
- **Resume upload as required first step** — PDF/DOCX parse is the mandatory entry point for job seekers; the parsed content pre-populates interview context and directly shapes the questions asked, so nothing is repeated from the resume and every follow-up is tailored to what's already known
- **Inline voice interview** — OpenAI Realtime API (WebRTC) interview runs embedded in the page (no separate window or app); feels like a real interviewer with dynamic follow-ups and occasional pushback to surface genuine signal; text-chat fallback available
- **Career narrative generation** — AI-produced story document organized by roles/projects after the interview, reads like a thoughtful case study
- **Structured agent-readable layer** — typed schema of roles, projects, claims, outcomes, inferred skills, and confidence levels stored alongside the narrative
- **Evidence collection** — per-claim proof step: file upload, URL, or soft context ("can't share publicly, but…") producing evidence objects with transparency flags (verified vs. self-reported)
- **Reference voice interview via shared link** — user adds references and links them to specific experiences; the system sends a unique link; when the reference opens it they go through the same inline voice interview experience the job seeker used, but scoped to questions about that candidate; the link presents a consent gate ("by continuing you agree your responses may be shared with the candidate and used as part of their career profile") before the interview begins; AI summarizes the conversation and attaches it to the relevant roles
- **Logged-out marketing homepage** — explains the full concept (what AwesomeWork is, how job seekers use it, how recruiters/agents use it, why it's more trustworthy than a resume); this is a required part of the build, not an afterthought
- **Candidate story page** — shareable public (or private) profile page: narrative + evidence highlights + reference snippets
- **Agent / recruiter search interface** — natural language query ("PM who took a product 0→1") returns ranked candidate summaries with claims, evidence, and reference signals, with drill-down to transcripts and evidence
- **Candidate control panel** — toggle visibility of sections, evidence, and references; edit or retract claims; set profile to public/private/agent-only

## Tech Stack
- Frontend: React + Vite + Tailwind (template already in place)
- Backend: Convex (real-time, serverless — stores profiles, claims, evidence objects, reference records, interview transcripts)
- AI: OpenAI (GPT-4o for interview orchestration, narrative generation, claim extraction, reference conversation, candidate matching/search)
- Audio: OpenAI Realtime API (WebRTC voice) for both job seeker and reference interviews; fallback to text-based chat
- File handling: Convex file storage for resume upload and artifact uploads
- Email: Resend (reference outreach invitation links, candidate notifications)
- Auth: Convex built-in auth (anonymous session for interview, account creation at save point) — no separate auth service to keep scope tight

## Scope & Constraints

**In scope:**
- Logged-out marketing homepage explaining the product
- Full job-seeker flow: resume upload (required) → tailored voice interview → narrative draft → evidence step → reference add → story page
- Reference flow: candidate sends link → reference opens link → consent gate → same inline voice interview experience → AI summary attached to candidate profile
- Agent/recruiter search page with natural language query and candidate card results
- Structured data schema (claims, outcomes, evidence, confidence) stored in Convex
- Candidate control panel (visibility, edit, delete)
- Voice interview via OpenAI Realtime API with text fallback
- Evidence upload (files + URLs) with verified/self-reported transparency labels
- Shareable profile link (public or private token-based)

**Out of scope for this one-shot:**
- Verified credential checks (third-party integrations like LinkedIn, GitHub)
- Billing, subscriptions, or usage metering
- Employer-side accounts or ATS integrations
- Mobile native app
- Multi-language support
- Analytics dashboard or admin panel

## Implementation Approach
1. **Schema + data model first** — define Convex schema for `profiles`, `roles`, `claims`, `evidence`, `references`, `interviewSessions`; get the structured layer right before any UI
2. **Marketing homepage** — build the logged-out landing page early so the concept is legible end-to-end from the first demo; this is the entry point for all users
3. **Resume upload + parse** — build the required first step; GPT-4o extracts roles, dates, and bullet points from the uploaded document to seed the interview context
4. **Interview engine** — build the inline voice/text interview component (OpenAI Realtime API); system prompt uses parsed resume as context; dynamic follow-up logic; pushback triggers; transcript storage in Convex; the same component is reused for the reference interview flow
5. **Narrative + structure generation** — post-interview pipeline: GPT-4o pass over transcript produces the human narrative document and extracts the structured claim/outcome/skill objects; store both
6. **Evidence flow** — per-claim evidence collection step (upload + soft context + skip) with verified/self-reported labels
7. **Reference invite flow** — candidate adds reference name + email + linked experiences; Resend delivers a unique link; link routes to a consent gate page then launches the same inline interview component in reference mode; AI summarizes and attaches to the candidate's profile
8. **Output surfaces** — candidate story page (public shareable), candidate control panel (visibility/edit), and agent search page (NL query → Convex text search + GPT-4o reranking → ranked candidate cards with drill-down)

## Open Questions
- **Voice API complexity**: OpenAI Realtime API (WebRTC) is the right fit for both interview flows but adds meaningful implementation complexity; confirm whether a text-chat fallback is acceptable as the primary PoC path if Realtime proves too heavy to ship first
- **Search mechanism**: Convex doesn't have native vector search; candidate matching will use full-text search + GPT-4o reranking — acceptable for PoC scale, but worth flagging if query quality matters on day one
- **Evidence verification**: the UX distinguishes "verified" vs. "self-reported" — for the PoC, "verified" means a file or URL was provided (no actual document analysis); is that framing sufficient or does the PoC need basic content extraction from uploaded docs?
- **Profile privacy model**: three modes are mentioned (public, private, agent-only) — for the PoC, is a single toggle (public shareable link vs. private) enough, or is the agent-only mode critical to demonstrate?
- **Reference consent copy**: the legal language on the reference link consent gate needs to be reviewed; for the PoC a short plain-English consent statement is assumed, but flag if legal review is required before launch
