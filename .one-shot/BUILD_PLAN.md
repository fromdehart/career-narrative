# Build Plan: AwesomeWork — Career Narrative

## 1. Overview

AwesomeWork transforms resumes into verifiable career narratives through AI-powered voice interviews, structured claim extraction, evidence collection, and peer reference interviews. The build starts from the existing Vite + React + Convex + Tailwind template and adds 9 routes, a new Convex schema (6 tables), ~25 Convex functions, and ~14 React components/pages.

**Critical runtime constraint:** Convex's HTTP router (`http.ts`) and all `httpAction` handlers run in the default runtime — never add `"use node"` to `http.ts`. The existing template has a bug here that must be fixed first. All new Convex action files that call OpenAI use `ctx.runAction(internal.openai.generateText)` or direct `fetch` — both work in the default runtime. Only `convex/openai.ts` and `convex/resend.ts` carry `"use node"` (they import npm packages needing Node.js).

---

## 2. File Changes Required

### File: `convex/http.ts`
- Action: MODIFY
- Purpose: Fix existing `"use node"` violation — httpActions cannot use Node.js runtime
- Key changes: Remove line 1 (`"use node";`). No other changes needed; the Telegram handler uses only fetch and standard Web APIs.

### File: `convex/schema.ts`
- Action: MODIFY
- Purpose: Replace template tables (events, data, votes, leads) with AwesomeWork domain tables
- Key changes: Define 6 new tables — `profiles`, `roles`, `claims`, `evidence`, `references`, `interviewSessions` — plus a search index on `profiles.searchText`

### File: `convex/profiles.ts`
- Action: CREATE
- Purpose: Profile CRUD — create anonymous profile, fetch by ID or shareToken, update status/visibility, store narrative
- Key changes: New file; queries + mutations; no `"use node"`

### File: `convex/roles.ts`
- Action: CREATE
- Purpose: Batch-insert roles parsed from resume; list roles for a profile
- Key changes: New file; mutations + queries; no `"use node"`

### File: `convex/claims.ts`
- Action: CREATE
- Purpose: Batch-insert AI-extracted claims; list claims; toggle visibility; edit text
- Key changes: New file; mutations + queries; no `"use node"`

### File: `convex/evidence.ts`
- Action: CREATE
- Purpose: Generate Convex file storage upload URLs; store file/URL/soft-context evidence records
- Key changes: New file; mutations + one action for `generateUploadUrl`; no `"use node"`

### File: `convex/references.ts`
- Action: CREATE
- Purpose: Create reference records; delegate invite email to Resend; update invite status; store reference interview summary; toggle visibility
- Key changes: New file; mutations + queries + one action that calls `ctx.runAction(internal.resend.sendReferenceInvite)`; no `"use node"`

### File: `convex/resume.ts`
- Action: CREATE
- Purpose: Take raw resume text extracted in the browser, call GPT-4o to parse it into structured roles array
- Key changes: New file; single action; calls `ctx.runAction(internal.openai.generateText)`; no `"use node"`

### File: `convex/interview.ts`
- Action: CREATE
- Purpose: Interview session lifecycle — create sessions, append transcript turns, get next AI question (text mode), get ephemeral key (voice mode), mark complete
- Key changes: New file; mutations + actions; `getRealtimeEphemeralKey` calls `https://api.openai.com/v1/realtime/sessions` via `fetch` (Web API — no `"use node"` needed)

### File: `convex/narrative.ts`
- Action: CREATE
- Purpose: Post-interview generation pipeline — transcript → GPT-4o → narrative markdown + structured claims; also generates reference interview summaries
- Key changes: New file; actions only; calls `ctx.runAction(internal.openai.generateText)`; no `"use node"`

### File: `convex/search.ts`
- Action: CREATE
- Purpose: Full-text search on published profiles using Convex search index, then GPT-4o reranking
- Key changes: New file; single action + one internal query; no `"use node"`

### File: `convex/resend.ts`
- Action: MODIFY
- Purpose: Add `sendReferenceInvite` action for reference invite emails
- Key changes: Add one new exported action following the existing pattern; keep all existing exports

### File: `convex/leads.ts`
- Action: DELETE
- Purpose: Template-only; unused in AwesomeWork

### File: `convex/votes.ts`
- Action: DELETE
- Purpose: Template-only; unused

### File: `convex/tracking.ts`
- Action: DELETE
- Purpose: Template-only; unused

### File: `src/App.tsx`
- Action: MODIFY
- Purpose: Replace single gated route with 9 application routes; remove GateScreen gate and VoteATron3000
- Key changes: Import all 9 page components; define route tree; keep `ConvexProvider` + `BrowserRouter`

### File: `src/pages/Landing.tsx`
- Action: CREATE
- Purpose: Marketing homepage for logged-out visitors

### File: `src/pages/Start.tsx`
- Action: CREATE
- Purpose: Resume upload entry point — browser-side text extraction, profile creation, session start

### File: `src/pages/Interview.tsx`
- Action: CREATE
- Purpose: Interview host page — loads profile + session, renders `VoiceInterview`

### File: `src/pages/Evidence.tsx`
- Action: CREATE
- Purpose: Steps through each AI-extracted claim; collects evidence per claim

### File: `src/pages/References.tsx`
- Action: CREATE
- Purpose: Reference management — add references, view invite status, publish profile

### File: `src/pages/Profile.tsx`
- Action: CREATE
- Purpose: Public shareable story page — narrative + claims + reference summaries

### File: `src/pages/Dashboard.tsx`
- Action: CREATE
- Purpose: Candidate control panel — visibility toggles, edit claims, copy share link

### File: `src/pages/Search.tsx`
- Action: CREATE
- Purpose: Agent/recruiter NL query interface — search results as candidate cards

### File: `src/pages/RefInterview.tsx`
- Action: CREATE
- Purpose: Reference interview — consent gate then voice/text interview, thank-you screen

### File: `src/components/VoiceInterview.tsx`
- Action: CREATE
- Purpose: Core interview component — WebRTC voice with automatic fallback to TextChat

### File: `src/components/TextChat.tsx`
- Action: CREATE
- Purpose: Text-based interview fallback with scrollable chat UI

### File: `src/components/ResumeUploader.tsx`
- Action: CREATE
- Purpose: Drag-and-drop file selector with browser-side PDF/DOCX text extraction

### File: `src/components/ProgressSteps.tsx`
- Action: CREATE
- Purpose: Five-step progress indicator used across all flow pages

### File: `src/components/ClaimCard.tsx`
- Action: CREATE
- Purpose: Single claim with type badge, confidence indicator, evidence chips, optional edit controls

### File: `src/components/EvidenceUploader.tsx`
- Action: CREATE
- Purpose: Three-tab evidence form — Upload File / Paste URL / Add Context

### File: `src/components/ReferenceForm.tsx`
- Action: CREATE
- Purpose: Add-reference form — name, email, relationship, role multi-select

### File: `src/components/ReferenceCard.tsx`
- Action: CREATE
- Purpose: Reference status card with expandable interview summary

### File: `src/components/NarrativeView.tsx`
- Action: CREATE
- Purpose: Renders AI-generated narrative markdown as styled prose using `marked`

### File: `src/components/CandidateCard.tsx`
- Action: CREATE
- Purpose: Search result card — narrative snippet, top claims, evidence/reference counts, link to profile

### File: `src/components/ConsentGate.tsx`
- Action: CREATE
- Purpose: Reference consent screen with plain-English agreement text before the interview begins

### File: `vercel.json`
- Action: CREATE
- Purpose: Rewrite all paths to `index.html` so client-side routing works on Vercel
- Key changes: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`

---

## 3. Convex Schema Changes

Complete replacement of `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    anonymousId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    status: v.union(
      v.literal("uploading"),
      v.literal("parsing"),
      v.literal("interviewing"),
      v.literal("generating"),
      v.literal("evidence"),
      v.literal("references"),
      v.literal("published")
    ),
    resumeText: v.optional(v.string()),
    narrativeMarkdown: v.optional(v.string()),
    searchText: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),
    shareToken: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_anonymousId", ["anonymousId"])
    .index("by_shareToken", ["shareToken"])
    .searchIndex("search_narrative", {
      searchField: "searchText",
      filterFields: ["visibility"],
    }),

  roles: defineTable({
    profileId: v.id("profiles"),
    title: v.string(),
    company: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    isCurrent: v.boolean(),
    summary: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_profile", ["profileId"]),

  claims: defineTable({
    profileId: v.id("profiles"),
    roleId: v.optional(v.id("roles")),
    text: v.string(),
    claimType: v.union(
      v.literal("outcome"),
      v.literal("skill"),
      v.literal("responsibility"),
      v.literal("achievement")
    ),
    confidenceScore: v.number(),
    isVisible: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_profile", ["profileId"])
    .index("by_role", ["roleId"]),

  evidence: defineTable({
    profileId: v.id("profiles"),
    claimId: v.id("claims"),
    evidenceType: v.union(
      v.literal("file"),
      v.literal("url"),
      v.literal("soft_context")
    ),
    storageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    url: v.optional(v.string()),
    context: v.optional(v.string()),
    verificationStatus: v.union(
      v.literal("verified"),
      v.literal("self_reported")
    ),
    isVisible: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_claim", ["claimId"])
    .index("by_profile", ["profileId"]),

  references: defineTable({
    profileId: v.id("profiles"),
    name: v.string(),
    email: v.string(),
    relationship: v.string(),
    linkedRoleIds: v.array(v.id("roles")),
    inviteToken: v.string(),
    inviteStatus: v.union(
      v.literal("pending"),
      v.literal("viewed"),
      v.literal("consented"),
      v.literal("interviewing"),
      v.literal("completed")
    ),
    interviewSummary: v.optional(v.string()),
    isVisible: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_profile", ["profileId"])
    .index("by_inviteToken", ["inviteToken"]),

  interviewSessions: defineTable({
    profileId: v.id("profiles"),
    sessionType: v.union(v.literal("candidate"), v.literal("reference")),
    referenceId: v.optional(v.id("references")),
    transcript: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned")
    ),
    mode: v.union(v.literal("voice"), v.literal("text")),
    systemContext: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_profile", ["profileId"])
    .index("by_reference", ["referenceId"]),
});
```

---

## 4. Convex Functions

### `profiles/createProfile` (mutation)
- Purpose: Create an anonymous profile at the start of the job-seeker flow
- Args: `{ anonymousId: v.string() }`
- Returns: `{ profileId: Id<"profiles">, shareToken: string }`
- Logic:
  1. Generate `shareToken` with `crypto.randomUUID()`
  2. Insert profile with `status: "uploading"`, `visibility: "private"`, `createdAt: Date.now()`, `updatedAt: Date.now()`
  3. Return `{ profileId: insertedId, shareToken }`

### `profiles/getProfile` (query)
- Purpose: Load a profile by its Convex ID (for the candidate's own session)
- Args: `{ profileId: v.id("profiles") }`
- Returns: Profile doc or null

### `profiles/getProfileByShareToken` (query)
- Purpose: Load a public profile by share token (public story page)
- Args: `{ shareToken: v.string() }`
- Returns: Profile doc where `visibility === "public"`, else null

### `profiles/updateStatus` (mutation)
- Purpose: Advance profile through flow stages
- Args: `{ profileId: v.id("profiles"), status: v.union(...all status literals) }`
- Returns: null
- Logic: `ctx.db.patch(profileId, { status, updatedAt: Date.now() })`

### `profiles/saveResumeText` (mutation)
- Purpose: Store browser-extracted resume text and advance to "parsing"
- Args: `{ profileId: v.id("profiles"), resumeText: v.string() }`
- Returns: null
- Logic: `ctx.db.patch(profileId, { resumeText, status: "parsing", updatedAt: Date.now() })`

### `profiles/saveNarrative` (mutation)
- Purpose: Store AI-generated narrative and aggregated search text; advance to "evidence"
- Args: `{ profileId: v.id("profiles"), narrativeMarkdown: v.string(), searchText: v.string() }`
- Returns: null
- Logic: `ctx.db.patch(profileId, { narrativeMarkdown, searchText, status: "evidence", updatedAt: Date.now() })`

### `profiles/setVisibility` (mutation)
- Purpose: Toggle profile public/private
- Args: `{ profileId: v.id("profiles"), visibility: v.union(v.literal("public"), v.literal("private")) }`
- Returns: null

### `profiles/setEmail` (mutation)
- Purpose: Associate email + name with a profile (collected at publish step)
- Args: `{ profileId: v.id("profiles"), email: v.string(), name: v.string() }`
- Returns: null

---

### `roles/createRolesFromResume` (mutation)
- Purpose: Batch-insert roles extracted from resume
- Args: `{ profileId: v.id("profiles"), roles: v.array(v.object({ title: v.string(), company: v.string(), startDate: v.optional(v.string()), endDate: v.optional(v.string()), isCurrent: v.boolean(), summary: v.optional(v.string()) })) }`
- Returns: `v.array(v.id("roles"))`
- Logic: Map over args.roles; insert each with `sortOrder = index`; return array of inserted IDs

### `roles/getRoles` (query)
- Purpose: List all roles for a profile ordered by sortOrder
- Args: `{ profileId: v.id("profiles") }`
- Returns: Array of role docs

---

### `claims/createClaims` (mutation)
- Purpose: Batch-insert AI-extracted claims after narrative generation
- Args: `{ profileId: v.id("profiles"), claims: v.array(v.object({ roleId: v.optional(v.id("roles")), text: v.string(), claimType: v.union(v.literal("outcome"), v.literal("skill"), v.literal("responsibility"), v.literal("achievement")), confidenceScore: v.number() })) }`
- Returns: null
- Logic: Insert each claim with `isVisible: true`, `sortOrder: index`

### `claims/getClaims` (query)
- Purpose: Get all claims for a profile (including hidden ones for dashboard view)
- Args: `{ profileId: v.id("profiles") }`
- Returns: Array of claim docs ordered by sortOrder

### `claims/toggleVisibility` (mutation)
- Purpose: Show/hide a claim on the public profile
- Args: `{ claimId: v.id("claims"), isVisible: v.boolean() }`
- Returns: null

### `claims/updateText` (mutation)
- Purpose: Allow candidate to edit claim wording
- Args: `{ claimId: v.id("claims"), text: v.string() }`
- Returns: null

---

### `evidence/generateUploadUrl` (mutation)
- Purpose: Generate a Convex storage upload URL so the client can PUT a file directly
- Args: none
- Returns: `string` (the upload URL)
- Logic: `return await ctx.storage.generateUploadUrl()`

### `evidence/createFileEvidence` (mutation)
- Purpose: Store a file evidence record after the client has uploaded the file
- Args: `{ profileId: v.id("profiles"), claimId: v.id("claims"), storageId: v.id("_storage"), fileName: v.string() }`
- Returns: null
- Logic: Insert evidence with `evidenceType: "file"`, `verificationStatus: "verified"`, `isVisible: true`, `createdAt: Date.now()`

### `evidence/createUrlEvidence` (mutation)
- Purpose: Store a URL evidence record
- Args: `{ profileId: v.id("profiles"), claimId: v.id("claims"), url: v.string() }`
- Returns: null
- Logic: Insert evidence with `evidenceType: "url"`, `verificationStatus: "verified"`

### `evidence/createSoftContextEvidence` (mutation)
- Purpose: Store a soft-context evidence record ("can't share publicly, but…")
- Args: `{ profileId: v.id("profiles"), claimId: v.id("claims"), context: v.string() }`
- Returns: null
- Logic: Insert evidence with `evidenceType: "soft_context"`, `verificationStatus: "self_reported"`

### `evidence/getEvidenceForProfile` (query)
- Purpose: Load all evidence records for a profile (client groups by claimId)
- Args: `{ profileId: v.id("profiles") }`
- Returns: Array of evidence docs

---

### `references/createReference` (mutation)
- Purpose: Create a reference record with a unique invite token
- Args: `{ profileId: v.id("profiles"), name: v.string(), email: v.string(), relationship: v.string(), linkedRoleIds: v.array(v.id("roles")) }`
- Returns: `{ referenceId: Id<"references">, inviteToken: string }`
- Logic:
  1. `inviteToken = crypto.randomUUID()`
  2. Insert reference with `inviteStatus: "pending"`, `isVisible: true`, `createdAt: Date.now()`
  3. Return `{ referenceId, inviteToken }`

### `references/sendInvite` (action)
- Purpose: Send reference invite email; delegates to `internal.resend.sendReferenceInvite`
- Args: `{ referenceId: v.id("references") }`
- Returns: `{ success: boolean }`
- Logic:
  1. `ctx.runQuery` to get reference record
  2. `ctx.runQuery` to get profile (for candidate name)
  3. Build `inviteUrl = process.env.SITE_URL + "/ref/" + reference.inviteToken`
  4. `ctx.runAction(internal.resend.sendReferenceInvite, { to: reference.email, candidateName: profile.name ?? "A candidate", inviteUrl, relationship: reference.relationship })`

### `references/getByInviteToken` (query)
- Purpose: Load reference + candidate name by invite token (for the `/ref/:token` page)
- Args: `{ inviteToken: v.string() }`
- Returns: `{ reference: ReferenceDoc, candidateName: string | null } | null`
- Logic: Find reference by `by_inviteToken` index; load profile; return joined object

### `references/updateStatus` (mutation)
- Purpose: Advance reference invite status as the reference progresses
- Args: `{ referenceId: v.id("references"), status: v.union(...all status literals) }`
- Returns: null

### `references/saveInterviewSummary` (mutation)
- Purpose: Store AI-generated summary of a completed reference interview
- Args: `{ referenceId: v.id("references"), summary: v.string() }`
- Returns: null
- Logic: `ctx.db.patch(referenceId, { interviewSummary: summary, inviteStatus: "completed" })`

### `references/getReferencesForProfile` (query)
- Purpose: List all references for a profile
- Args: `{ profileId: v.id("profiles") }`
- Returns: Array of reference docs

### `references/toggleVisibility` (mutation)
- Purpose: Show/hide a reference's summary on the public profile
- Args: `{ referenceId: v.id("references"), isVisible: v.boolean() }`
- Returns: null

---

### `resume/parseResumeToRoles` (action)
- Purpose: Call GPT-4o to extract structured roles from raw resume text
- Args: `{ resumeText: v.string() }`
- Returns: `{ roles: Array<{ title: string, company: string, startDate: string | null, endDate: string | null, isCurrent: boolean, summary: string }> }`
- Logic:
  1. Build prompt: `"Extract all work experience roles from this resume. Return ONLY valid JSON: { \"roles\": [{ \"title\": string, \"company\": string, \"startDate\": \"YYYY-MM\" | null, \"endDate\": \"YYYY-MM\" | null, \"isCurrent\": boolean, \"summary\": string }] }. Set isCurrent=true when end date is missing or says 'present'. Summary: 1-2 sentences describing the role's focus. Resume: {resumeText}"`
  2. `ctx.runAction(internal.openai.generateText, { prompt, model: "gpt-4o", temperature: 0 })`
  3. Parse JSON from `response.text`; return `{ roles: parsed.roles }` (fallback to `{ roles: [] }` on parse error)

---

### `interview/startSession` (mutation)
- Purpose: Create a new interview session record
- Args: `{ profileId: v.id("profiles"), sessionType: v.union(v.literal("candidate"), v.literal("reference")), referenceId: v.optional(v.id("references")), mode: v.union(v.literal("voice"), v.literal("text")), systemContext: v.string() }`
- Returns: `{ sessionId: Id<"interviewSessions"> }`
- Logic: Insert with `status: "active"`, `transcript: []`, `createdAt: Date.now()`

### `interview/addMessage` (mutation)
- Purpose: Append one transcript turn to a session
- Args: `{ sessionId: v.id("interviewSessions"), role: v.union(v.literal("user"), v.literal("assistant")), content: v.string() }`
- Returns: null
- Logic:
  1. `const session = await ctx.db.get(sessionId)`
  2. `ctx.db.patch(sessionId, { transcript: [...session.transcript, { role, content, timestamp: Date.now() }] })`

### `interview/getSession` (query)
- Purpose: Load a session including full transcript
- Args: `{ sessionId: v.id("interviewSessions") }`
- Returns: Session doc or null

### `interview/getNextQuestion` (action)
- Purpose: Given a session's current transcript, call GPT-4o for the next interviewer question (text mode)
- Args: `{ sessionId: v.id("interviewSessions") }`
- Returns: `{ question: string }`
- Logic:
  1. `ctx.runQuery(internal.interview.getSession, { sessionId })`
  2. Format transcript as `role: content` lines
  3. `ctx.runAction(internal.openai.generateText, { systemPrompt: "You are a career interviewer. Ask ONE targeted follow-up question. Be specific — ask for numbers, the candidate's personal contribution, or concrete outcomes. Do not repeat what was already covered. Output ONLY the question, nothing else.", prompt: formattedTranscript, model: "gpt-4o", temperature: 0.7 })`
  4. Return `{ question: response.text.trim() }`

### `interview/getRealtimeEphemeralKey` (action)
- Purpose: Generate a short-lived ephemeral key so the client can open a WebRTC voice session directly with OpenAI's Realtime API
- Args: `{ sessionId: v.id("interviewSessions") }`
- Returns: `{ ephemeralKey: string }`
- Logic:
  1. `ctx.runQuery(internal.interview.getSession, { sessionId })` → get `systemContext`
  2. `fetch("https://api.openai.com/v1/realtime/sessions", { method: "POST", headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY!, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-4o-realtime-preview", voice: "alloy", instructions: session.systemContext }) })`
  3. Parse response; return `{ ephemeralKey: data.client_secret.value }`

### `interview/completeSession` (mutation)
- Purpose: Mark a session as done
- Args: `{ sessionId: v.id("interviewSessions") }`
- Returns: null
- Logic: `ctx.db.patch(sessionId, { status: "completed", completedAt: Date.now() })`

---

### `narrative/generateFromSession` (action)
- Purpose: Post-interview pipeline — full transcript → GPT-4o → narrative markdown + structured claims array; stores both back into Convex
- Args: `{ sessionId: v.id("interviewSessions"), profileId: v.id("profiles") }`
- Returns: `{ success: boolean }`
- Logic:
  1. `ctx.runQuery` to get session (transcript, systemContext) and profile (resumeText)
  2. `ctx.runQuery(internal.roles.getRoles, { profileId })` → role list
  3. Build prompt:
     ```
     Given this interview transcript and resume, produce a career profile. Return ONLY valid JSON:
     {
       "narrative": "markdown string ~600 words organized by role, reads like a thoughtful case study",
       "claims": [{ "text": "specific verifiable assertion", "claimType": "outcome|skill|responsibility|achievement", "confidenceScore": 0.0-1.0, "roleCompany": "company name or null" }]
     }
     Resume: {resumeText}
     Transcript: {formattedTranscript}
     ```
  4. `ctx.runAction(internal.openai.generateText, { prompt, model: "gpt-4o", temperature: 0.4 })`
  5. Parse JSON; return `{ success: false }` on parse error
  6. Compute `searchText = narrative + " " + claims.map(c => c.text).join(" ")`
  7. `ctx.runMutation(internal.profiles.saveNarrative, { profileId, narrativeMarkdown: parsed.narrative, searchText })`
  8. Build `company → roleId` map from step 2; map each claim's `roleCompany` to a `roleId` via case-insensitive includes match
  9. `ctx.runMutation(internal.claims.createClaims, { profileId, claims: mappedClaims })`
  10. `ctx.runMutation(internal.interview.completeSession, { sessionId })`
  11. Return `{ success: true }`

### `narrative/generateReferenceSummary` (action)
- Purpose: Summarize a completed reference interview into a 2-4 sentence paragraph; store on the reference record
- Args: `{ sessionId: v.id("interviewSessions"), referenceId: v.id("references") }`
- Returns: `{ success: boolean }`
- Logic:
  1. `ctx.runQuery` to get session transcript and reference name
  2. Prompt: `"Summarize what {referenceName} said about the candidate in 2-4 sentences. Focus on specific contributions and strengths. Be concrete. Transcript: {formattedTranscript}"`
  3. `ctx.runAction(internal.openai.generateText, { prompt, model: "gpt-4o", temperature: 0.3 })`
  4. `ctx.runMutation(internal.references.saveInterviewSummary, { referenceId, summary: response.text.trim() })`
  5. Return `{ success: true }`

---

### `search/fullTextSearch` (query) — internal
- Purpose: Wrapper query so the `searchCandidates` action can run a Convex search index (actions cannot call `ctx.db` directly)
- Args: `{ query: v.string() }`
- Returns: Array of profile docs
- Logic: `ctx.db.query("profiles").withSearchIndex("search_narrative", q => q.search("searchText", args.query).eq("visibility", "public")).take(20)`

### `search/searchCandidates` (action)
- Purpose: Full-text search + GPT-4o reranking → ranked candidate summaries
- Args: `{ query: v.string() }`
- Returns: `Array<{ profileId, shareToken, name, narrativeSnippet: string, topClaims: string[], score: number }>`
- Logic:
  1. `ctx.runQuery(internal.search.fullTextSearch, { query })` → up to 20 profiles
  2. If 0 results, return `[]`
  3. For each profile fetch top 3 claims via `ctx.runQuery(internal.claims.getClaims)`
  4. Build rerank prompt: list each profile's narrative snippet + claims; ask GPT-4o to return JSON array `[{ profileId, score }]` ranked by relevance to `query`
  5. `ctx.runAction(internal.openai.generateText, { prompt, model: "gpt-4o", temperature: 0 })`
  6. Parse reranked list; map back to profile objects with snippets + claims; return sorted array

---

### `resend/sendReferenceInvite` (action) — new export in `convex/resend.ts`
- Purpose: Send the reference invite email
- Args: `{ to: v.string(), candidateName: v.string(), inviteUrl: v.string(), relationship: v.string() }`
- Returns: `{ success: boolean, error?: string }`
- Logic: Same Resend pattern as existing `sendEmail`; subject: `"{candidateName} invited you to be a career reference on AwesomeWork"`; HTML body explains what AwesomeWork is, who invited them, a plain-English consent note ("your responses may be shared with {candidateName}"), and a large CTA button linking to `inviteUrl`

---

## 5. React Components & Pages

### `Landing` — `src/pages/Landing.tsx`
- Props: none | State: none
- Key UI:
  - **Hero**: "Your career deserves better than a resume" headline; "AwesomeWork turns your resume and a 20-minute interview into a verified, searchable career profile" subtext; "Start your profile →" primary button (→ `/start`); "Search candidates" secondary link (→ `/search`)
  - **How It Works**: Three numbered steps with icons — 1) Upload your resume 2) Tell your story in a 20-min voice interview 3) Share a verified profile link
  - **Why it works**: Three columns — "Real signal, not buzzwords" / "Evidence-backed claims" / "Peer references in context"
  - **For recruiters/agents**: Dark-bg section — "Search across verified profiles in plain English" + mock search bar showing `"PM who scaled a product 0→1"` + 2 fake result cards
  - **Footer**: Logo + "AwesomeWork" + tagline "The career profile a resume can't replace"

### `Start` — `src/pages/Start.tsx`
- State: `{ file: File | null, extractedText: string, fileName: string, parsing: boolean, error: string | null }`
- Behavior:
  1. `ResumeUploader` calls `onTextExtracted(text, fileName)` → set state
  2. On "Continue": `anonymousId = crypto.randomUUID()` → `localStorage.setItem("aww-anonymous-id", anonymousId)`
  3. `profiles.createProfile({ anonymousId })` → `{ profileId, shareToken }` → `localStorage.setItem("aww-profile-id", profileId)`
  4. `profiles.saveResumeText({ profileId, resumeText: extractedText })`
  5. `resume.parseResumeToRoles({ resumeText: extractedText })` → `{ roles }`
  6. `roles.createRolesFromResume({ profileId, roles })`
  7. Build candidate `systemContext` string (see below)
  8. `interview.startSession({ profileId, sessionType: "candidate", mode: "voice", systemContext })` → `{ sessionId }`
  9. `navigate(\`/interview/${profileId}?session=${sessionId}\`)`
- Key UI: `ProgressSteps currentStep={1}`; `ResumeUploader`; green checkmark + file name after extraction; "Continue to Interview" button (disabled until extractedText non-empty; spinner during async steps); error message on failure

**Candidate system context** (built in `Start.tsx`):
```
You are an expert career interviewer at AwesomeWork. You have the candidate's resume in front of you.

Your goal: surface their most impressive, authentic career stories through targeted questions.
- Ask ONE question at a time and wait for the full answer before asking the next.
- Do NOT repeat anything already on the resume. Reference it to show familiarity.
- Dig for specifics: numbers, timelines, their personal contribution vs. the team's.
- Push back gently on vague answers: "Can you be more specific about what you personally did?"
- Cover 3-4 key roles or projects, about 5 minutes each.
- After enough depth, ask: "Is there anything important about your career that we haven't covered yet?"
- When the conversation feels complete, say exactly: "This has been a great conversation. I have everything I need to build your profile. Thank you."
That closing phrase signals the end of the session.

Resume:
${resumeText}
```

### `Interview` — `src/pages/Interview.tsx`
- State: `{ profile, sessionId, generating: boolean }`
- Behavior:
  - `profileId` from URL params; `sessionId` from `?session=` query param
  - On `VoiceInterview.onComplete`:
    1. `setGenerating(true)`
    2. `narrative.generateFromSession({ sessionId, profileId })`
    3. `navigate(\`/evidence/${profileId}\`)`
- Key UI: `ProgressSteps currentStep={2}`; `VoiceInterview` filling the viewport; generating overlay with spinner + "Building your profile…"

### `Evidence` — `src/pages/Evidence.tsx`
- State: `{ claims, evidenceByClaimId, currentIndex: number, done: boolean }`
- Behavior: Step through claims one at a time; "Skip this claim →" link advances index; after last claim, "Done — add references" navigates to `/references/${profileId}`; "Skip all" link always available
- Key UI: `ProgressSteps currentStep={3}`; claim counter "Claim 2 of 7"; claim text large; `EvidenceUploader` below; progress dots row

### `References` — `src/pages/References.tsx`
- State: `{ references, showForm: boolean, publishing: boolean, showEmailModal: boolean, nameValue: string, emailValue: string }`
- Behavior:
  - "+ Add Reference" toggles `ReferenceForm` inline
  - On form submit: `createReference` + `sendInvite` → refresh list → hide form
  - "Publish profile": if no `profile.email`, show email/name modal → `profiles.setEmail` → `profiles.setVisibility("public")` → `navigate(\`/dashboard/${profileId}\`)`
- Key UI: `ProgressSteps currentStep={4}`; list of `ReferenceCard`; collapsible `ReferenceForm`; "Skip / Publish profile" button at bottom

### `Profile` — `src/pages/Profile.tsx`
- State: `{ profile, roles, claims, evidenceByClaimId, references, loading }`
- Behavior: `useQuery(api.profiles.getProfileByShareToken, { shareToken })`; if null show locked state; loads dependent data reactively
- Key UI: Name + current role header; "Share" button (clipboard); `NarrativeView`; "Key Contributions" grid of `ClaimCard` (visible only, `editMode={false}`); "What colleagues say" section with visible `ReferenceCard` summaries

### `Dashboard` — `src/pages/Dashboard.tsx`
- State: `{ profile, claims, references, copySuccess: boolean }`
- Behavior: All toggles call corresponding mutations; "Copy link" writes `${origin}/profile/${shareToken}` to clipboard; `useQuery` keeps all data live
- Key UI: "Your Profile" heading + public/private Switch; "Copy shareable link" button + "View public profile" link; Claims section with `ClaimCard editMode={true}`; References section with `ReferenceCard editMode={true}`

### `Search` — `src/pages/Search.tsx`
- State: `{ query: string, results, loading: boolean, searched: boolean }`
- Behavior: Form submit calls `useAction(api.search.searchCandidates)`; renders `CandidateCard` grid; empty state if searched and no results
- Key UI: Large centered search bar; placeholder `"PM who took a product from 0→1…"`; 2-column `CandidateCard` grid; skeleton placeholders while loading; empty state with example query chips

### `RefInterview` — `src/pages/RefInterview.tsx`
- State: `{ reference, candidateName, stage: "loading" | "consent" | "interview" | "done", sessionId }`
- Behavior:
  1. `useQuery(api.references.getByInviteToken, { inviteToken })` → set data
  2. Effect: call `references.updateStatus({ referenceId, status: "viewed" })` once on load
  3. On consent: `updateStatus("consented")` → build reference `systemContext` → `interview.startSession(...)` → `stage = "interview"`
  4. On `VoiceInterview.onComplete`: `narrative.generateReferenceSummary(...)` → `stage = "done"`
- Key UI: Loading spinner; `ConsentGate` (consent stage); `VoiceInterview` (interview stage); thank-you card with "{referenceName}, your responses have been saved and shared with {candidateName}." (done stage)

**Reference system context** (built in `RefInterview.tsx`):
```
You are interviewing ${reference.name} about their professional experience working with ${candidateName}. Their responses will be included in ${candidateName}'s career profile on AwesomeWork, with ${reference.name}'s full consent.

Your goals:
- Ask about the working relationship and duration
- Ask for 2-3 specific examples of ${candidateName}'s contributions and impact
- Ask about ${candidateName}'s key strengths
- Keep it conversational and positive — this is a reference conversation, not a review
- When you have enough, say exactly: "Thank you so much for your time. This gives us a great picture of ${candidateName}'s work."
That closing phrase signals the end of the session.

Context: ${candidateName} worked as ${linkedRoleSummaries}
```

---

### `VoiceInterview` — `src/components/VoiceInterview.tsx`
- Props: `{ sessionId: Id<"interviewSessions">, profileId: Id<"profiles">, onComplete: () => void }`
- State: `{ mode: "voice" | "text", voiceStatus: "requesting-mic" | "connecting" | "connected" | "error", subtitle: string, peerConnection: RTCPeerConnection | null }`
- Behavior:
  1. Mount: `navigator.mediaDevices.getUserMedia({ audio: true })` → if denied or error, `setMode("text")`
  2. If mic granted: call `useAction(api.interview.getRealtimeEphemeralKey)({ sessionId })` → `{ ephemeralKey }`
  3. `pc = new RTCPeerConnection()`; `pc.addTrack(micTrack)`; create data channel `"oai-events"`
  4. `await pc.setLocalDescription(await pc.createOffer())`
  5. `fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview", { method: "POST", headers: { Authorization: "Bearer " + ephemeralKey, "Content-Type": "application/sdp" }, body: pc.localDescription.sdp })` → get answer SDP text → `pc.setRemoteDescription({ type: "answer", sdp: answerSdp })`
  6. `pc.ontrack = (e) => { audioEl.srcObject = e.streams[0]; audioEl.play() }` — plays AI audio output
  7. Data channel events:
     - `response.audio_transcript.delta` → append to `subtitle` state
     - `response.audio_transcript.done` → `interview.addMessage({ role: "assistant", content: fullSubtitle })`; check if content includes the closing phrase → call `onComplete`; clear subtitle
     - `conversation.item.input_audio_transcription.completed` → `interview.addMessage({ role: "user", content: event.transcript })`
  8. "Switch to text" button: `pc.close(); setMode("text")`
  9. "End interview" button: `pc.close(); onComplete()`
- Key UI (voice mode): Large animated circle (CSS `animate-pulse` when AI speaking, static ring when listening based on audio level or event); subtitle text below circle; "End interview" button; "Switch to text mode" small link below
- Key UI (text mode): Renders `<TextChat sessionId={sessionId} onComplete={onComplete} />`

### `TextChat` — `src/components/TextChat.tsx`
- Props: `{ sessionId: Id<"interviewSessions">, onComplete: () => void }`
- State: `{ inputValue: string, sending: boolean }`
- Behavior:
  - `useQuery(api.interview.getSession, { sessionId })` → live transcript
  - On send: `interview.addMessage({ role: "user", content: inputValue })` then `interview.getNextQuestion({ sessionId })` → adds assistant message automatically
  - Auto-scroll to bottom on transcript change
  - "End interview" button appears after `userTurnCount >= 8`
- Key UI: Scrollable message list (assistant: left-aligned gray bubble, user: right-aligned colored bubble); fixed bottom input area with `<textarea>` + "Send" button; "End interview" button conditionally shown

### `ResumeUploader` — `src/components/ResumeUploader.tsx`
- Props: `{ onTextExtracted: (text: string, fileName: string) => void }`
- State: `{ dragging: boolean, fileName: string, processing: boolean, error: string | null }`
- Behavior:
  - Accept `.pdf` and `.docx` via drag-drop or click
  - **PDF**: `import * as pdfjsLib from "pdfjs-dist"` at module level; set `pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()` at module level (not in a hook); load document; iterate pages; join text content items
  - **DOCX**: `import mammoth from "mammoth"` → `mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })` → `.value`
  - Other types: set error "Only PDF and DOCX files are supported"
  - On success: `onTextExtracted(text, file.name)`
- Key UI: Dashed-border dropzone (border turns solid on drag-over); cloud-upload icon; "Drop your resume here, or click to browse" label; "PDF or DOCX · max 10MB" helper; file name + green check after extraction; spinner during processing; red error text if unsupported

### `ProgressSteps` — `src/components/ProgressSteps.tsx`
- Props: `{ currentStep: 1 | 2 | 3 | 4 | 5 }`
- Key UI: Five labeled steps connected by horizontal lines — "Upload" | "Interview" | "Evidence" | "References" | "Profile". Completed: filled circle with checkmark. Current: filled circle with step number in accent color. Future: gray circle with number. Labels below each circle.

### `ClaimCard` — `src/components/ClaimCard.tsx`
- Props: `{ claim: ClaimDoc, evidence: EvidenceDoc[], editMode?: boolean, onToggleVisibility?: (id: Id<"claims">, v: boolean) => void, onEditText?: (id: Id<"claims">) => void }`
- Key UI: Claim text (semibold); type badge (outcome=green, skill=blue, achievement=amber, responsibility=gray); confidence bar (thin, fills proportionally to `confidenceScore`, green); evidence chips per evidence record ("verified file" / "verified URL" / "self-reported", each with icon); in `editMode`: eye-toggle switch + pencil icon button on the right

### `EvidenceUploader` — `src/components/EvidenceUploader.tsx`
- Props: `{ profileId: Id<"profiles">, claimId: Id<"claims">, onSubmit: () => void, onSkip: () => void }`
- State: `{ activeTab: "file" | "url" | "context", urlValue: string, contextValue: string, uploading: boolean }`
- Behavior:
  - **File tab**: click to select → `evidence.generateUploadUrl` mutation → `fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } })` → parse `storageId` from response → `evidence.createFileEvidence({ storageId, fileName: file.name })`
  - **URL tab**: validate URL (`new URL(val)` doesn't throw and starts with http/https) → `evidence.createUrlEvidence`
  - **Context tab**: require min 20 chars → `evidence.createSoftContextEvidence`
  - All paths call `onSubmit` after success
- Key UI: Radix Tabs with three tabs; file tab has click-to-browse area; URL tab has text input; context tab has textarea with helper "e.g. 'I can share more details in person' or describe the context privately"; submit button per tab; "Skip this claim" plain link

### `ReferenceForm` — `src/components/ReferenceForm.tsx`
- Props: `{ profileId: Id<"profiles">, roles: RoleDoc[], onCreated: () => void, onCancel: () => void }`
- State: `{ name: string, email: string, relationship: string, selectedRoleIds: Id<"roles">[], submitting: boolean }`
- Behavior: Submit → `references.createReference` → `references.sendInvite` → `onCreated()`
- Key UI: Name / email / relationship inputs (relationship placeholder: "e.g. Manager at Acme, Peer at Startup"); checkbox list of roles; "Send Invite" primary button; "Cancel" plain link

### `ReferenceCard` — `src/components/ReferenceCard.tsx`
- Props: `{ reference: ReferenceDoc, editMode?: boolean, onToggleVisibility?: (id, v: boolean) => void }`
- State: `{ expanded: boolean }`
- Key UI: Name + relationship; status badge (pending=gray, viewed=yellow, consented=blue, completed=green); "Re-send invite" button if status is pending; expandable summary paragraph (shown when completed); in `editMode`: eye-toggle switch

### `NarrativeView` — `src/components/NarrativeView.tsx`
- Props: `{ markdown: string }`
- Key UI: `const html = marked.parse(markdown)` → `<div dangerouslySetInnerHTML={{ __html: html as string }} className="prose prose-slate max-w-none" />`
- Note: `@tailwindcss/typography` must be in `tailwind.config.js` plugins for `prose` classes to work

### `CandidateCard` — `src/components/CandidateCard.tsx`
- Props: `{ result: { profileId: Id<"profiles">, shareToken: string, name?: string, narrativeSnippet: string, topClaims: string[], score: number } }`
- Key UI: Name (or "Anonymous candidate"); 2-line narrative snippet; 3 claim bullets; relevance percentage badge; "View profile →" link to `/profile/${shareToken}`

### `ConsentGate` — `src/components/ConsentGate.tsx`
- Props: `{ reference: ReferenceDoc, candidateName: string, onConsent: () => void }`
- State: `{ consenting: boolean }`
- Behavior: "I agree" button → set `consenting=true` → call `onConsent()`; "Decline" link navigates to `/`
- Key UI: AwesomeWork logo mark; "Reference Interview" heading; "{candidateName} has invited you to share your perspective on their work."; consent text: "By continuing, you agree that your responses in this interview may be shared with {candidateName} and included in their career profile on AwesomeWork. This is entirely voluntary. You may stop at any time."; "I agree — start the interview" primary button; "Decline" plain link

---

## 6. Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_CONVEX_URL` | `.env` (client) | Convex deployment URL |
| `OPENAI_API_KEY` | Convex dashboard (server) | GPT-4o + Realtime API access (requires Tier 3+ for Realtime) |
| `RESEND_API_KEY` | Convex dashboard (server) | Resend email delivery |
| `RESEND_FROM` | Convex dashboard (server) | Verified sender, e.g. `AwesomeWork <hello@awesomework.xyz>` |
| `SITE_URL` | Convex dashboard (server) | Base URL for invite links, e.g. `https://awesomework.xyz` (no trailing slash) |

Remove all template env vars: `VITE_CHALLENGE_ID`, `VITE_GATE_TITLE`, `VITE_GATE_SUBTITLE`, `VITE_GATE_DESCRIPTION`, `VITE_RECAPTCHA_SITE_KEY`, `VITE_VEED_VIDEO_URL`, `VITE_VEED_VIDEO_ID`.

---

## 7. Build Sequence

Follow this order exactly. Each step must compile cleanly before proceeding to the next.

1. **Fix `convex/http.ts`** — Remove `"use node"` from line 1. No other changes; the handler uses only `fetch` and standard Web APIs.

2. **Delete template Convex files** — Delete `convex/leads.ts`, `convex/votes.ts`, `convex/tracking.ts`. Search for any imports of these files in the codebase and remove them.

3. **Replace `convex/schema.ts`** — Write the 6-table schema from Section 3. Run `npx convex dev` and confirm the schema pushes without error before continuing.

4. **Create `convex/profiles.ts`** — All 8 functions listed in Section 4.

5. **Create `convex/roles.ts`** — `createRolesFromResume`, `getRoles`.

6. **Create `convex/claims.ts`** — `createClaims`, `getClaims`, `toggleVisibility`, `updateText`.

7. **Create `convex/evidence.ts`** — `generateUploadUrl`, `createFileEvidence`, `createUrlEvidence`, `createSoftContextEvidence`, `getEvidenceForProfile`.

8. **Create `convex/references.ts`** — All 7 functions. `sendInvite` references `internal.resend.sendReferenceInvite` which doesn't exist yet; add a temporary stub `return { success: false }` so the file compiles, then replace it in step 9.

9. **Add `sendReferenceInvite` to `convex/resend.ts`** — Full implementation. Remove the stub from step 8.

10. **Create `convex/resume.ts`** — `parseResumeToRoles` action.

11. **Create `convex/interview.ts`** — `startSession`, `addMessage`, `getSession`, `getNextQuestion`, `getRealtimeEphemeralKey`, `completeSession`.

12. **Create `convex/narrative.ts`** — `generateFromSession`, `generateReferenceSummary`.

13. **Create `convex/search.ts`** — `fullTextSearch` (internal query) + `searchCandidates` (action).

14. **Run `npx convex codegen`** — Must exit 0. Fix all TypeScript errors before proceeding.

15. **Install npm packages** — `npm install pdfjs-dist mammoth marked @tailwindcss/typography`

16. **Update `tailwind.config.js`** — Add `require("@tailwindcss/typography")` to the `plugins` array.

17. **Update `src/App.tsx`** — Replace the routing tree with the 9 routes below. Remove `useGateAccess`, `GateScreen`, and `VoteATron3000`. Keep `ConvexProvider` + `BrowserRouter`.
    ```tsx
    <Route path="/" element={<Landing />} />
    <Route path="/start" element={<Start />} />
    <Route path="/interview/:profileId" element={<Interview />} />
    <Route path="/evidence/:profileId" element={<Evidence />} />
    <Route path="/references/:profileId" element={<References />} />
    <Route path="/dashboard/:profileId" element={<Dashboard />} />
    <Route path="/profile/:shareToken" element={<Profile />} />
    <Route path="/search" element={<Search />} />
    <Route path="/ref/:inviteToken" element={<RefInterview />} />
    ```

18. **Build `src/components/ProgressSteps.tsx`** — No Convex dependency; verify it renders.

19. **Build `src/pages/Landing.tsx`** — Static; verify all three sections and both CTA links.

20. **Build `src/components/ResumeUploader.tsx`** — Set `pdfjsLib.GlobalWorkerOptions.workerSrc` at module level (outside component). Test PDF extraction with a small file before wiring to the flow.

21. **Build `src/pages/Start.tsx`** — Wire all mutations/actions in sequence. Verify a profile document appears in the Convex dashboard after a test run.

22. **Build `src/components/TextChat.tsx`** — Build and test the text fallback before building the voice component.

23. **Build `src/components/VoiceInterview.tsx`** — Voice path first; confirm WebRTC connects and audio plays; confirm automatic fallback to `TextChat` when mic is denied.

24. **Build `src/pages/Interview.tsx`** — Wire `VoiceInterview` + `generateFromSession` call + generating overlay.

25. **Build `src/components/ClaimCard.tsx`**.

26. **Build `src/components/EvidenceUploader.tsx`** — Test all three tabs. Verify Convex storage upload creates a visible file in the Convex dashboard Storage tab.

27. **Build `src/pages/Evidence.tsx`** — Wire claim list + per-claim evidence flow.

28. **Build `src/components/ReferenceForm.tsx`** and **`src/components/ReferenceCard.tsx`**.

29. **Build `src/pages/References.tsx`** — Wire form + invite send + publish flow.

30. **Build `src/components/NarrativeView.tsx`** — Test with a sample markdown string including headings, bold, and bullets.

31. **Build `src/pages/Profile.tsx`** — Test with a public shareToken. Verify private profiles show locked state.

32. **Build `src/pages/Dashboard.tsx`** — Test visibility toggles; confirm changes reflect immediately on Profile page.

33. **Build `src/components/CandidateCard.tsx`**.

34. **Build `src/pages/Search.tsx`** — Requires at least one published profile with `searchText` to test meaningfully.

35. **Build `src/components/ConsentGate.tsx`**.

36. **Build `src/pages/RefInterview.tsx`** — Test full reference flow end-to-end with a real invite token from step 29.

37. **Create `vercel.json`** at the project root with the rewrite rule.

38. **`npm run build`** — Must exit 0 with no TypeScript errors.

39. **`npx convex codegen`** — Must exit 0.

---

## 8. Test Criteria

**Build:**
- `npm run build` exits 0
- `npx convex codegen` exits 0

**Route smoke tests:**
- `/` renders Landing with hero headline, 3-step section, and working CTAs
- `/start` — drop a PDF, text is extracted and Continue button enables; submitting creates profile + roles + session in Convex
- `/interview/:profileId` — TextChat renders if mic denied; messages round-trip through GPT-4o; ending the interview triggers generating overlay and navigates to `/evidence`
- `/evidence/:profileId` — claims listed; file upload creates evidence doc with `verificationStatus: "verified"`; URL and context paths also create records; "Done" navigates to `/references`
- `/references/:profileId` — ReferenceForm creates reference doc + invite appears in Resend dashboard; publishing sets `visibility: "public"` and navigates to `/dashboard`
- `/ref/:inviteToken` — ConsentGate shows correct candidate name; agree starts interview; completing saves `interviewSummary` to reference doc and shows thank-you
- `/dashboard/:profileId` — visibility toggles update Convex live; share link copied to clipboard is a valid `/profile/:shareToken` URL
- `/profile/:shareToken` (public) — narrative, visible claims, and visible reference summaries render
- `/profile/:shareToken` (private) — locked message shown
- `/search` — querying "engineer" returns candidate cards for any published profiles

---

## 9. Deployment Notes

**Convex:**
- `npx convex deploy` pushes all functions and schema to production
- Set env vars in the Convex dashboard (Settings → Environment Variables): `OPENAI_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `SITE_URL`
- The `search_narrative` search index is created automatically from the schema on deploy
- Convex file storage is included on all plans; no separate configuration needed

**Vercel:**
- Set `VITE_CONVEX_URL` to the production Convex deployment URL in Vercel environment variables
- The `vercel.json` rewrite is required — without it, direct navigation to `/profile/abc123` returns a 404
- Build command: `npm run build`; output directory: `dist`

**OpenAI Realtime API:**
- `gpt-4o-realtime-preview` requires OpenAI Tier 3+ usage or explicit access; verify before demo
- Ephemeral keys expire 60 seconds after creation — the WebRTC SDP exchange must complete within that window; if it fails, call `getRealtimeEphemeralKey` again and retry
- Set an OpenAI account spending cap to prevent runaway usage during demos

**Resend:**
- The sender domain in `RESEND_FROM` must be verified in the Resend dashboard before outbound email delivers
- In local dev use a Resend test key — emails only deliver to the account's registered email, which is sufficient to test the reference invite flow end-to-end

**pdfjs-dist Vite worker:**
- The `GlobalWorkerOptions.workerSrc` assignment using `import.meta.url` must be at module level in `ResumeUploader.tsx`, not inside a hook or function — Vite's asset bundling requires this to resolve the worker path at build time
