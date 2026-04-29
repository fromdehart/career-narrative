import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const generateFromSession = action({
  args: {
    sessionId: v.id("interviewSessions"),
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.interview.getSessionInternal, {
      sessionId: args.sessionId,
    });
    const profile = await ctx.runQuery(internal.profiles.getProfileInternal, {
      profileId: args.profileId,
    });
    const roles = await ctx.runQuery(internal.roles.getRolesInternal, {
      profileId: args.profileId,
    });

    if (!session || !profile) return { success: false };

    const formattedTranscript = session.transcript
      .map((t) => `${t.role}: ${t.content}`)
      .join("\n");

    const prompt = `Given this interview transcript and resume, produce a career profile. Return ONLY valid JSON:
{
  "narrative": "markdown string ~600 words organized by role, reads like a thoughtful case study",
  "claims": [{ "text": "specific verifiable assertion", "claimType": "outcome|skill|responsibility|achievement", "confidenceScore": 0.0-1.0, "roleCompany": "company name or null" }]
}
Resume: ${profile.resumeText ?? ""}
Transcript: ${formattedTranscript}`;

    const response = await ctx.runAction(internal.openai.generateText, {
      prompt,
      model: "gpt-4o",
      temperature: 0.4,
    });

    let parsed: {
      narrative: string;
      claims: Array<{
        text: string;
        claimType: string;
        confidenceScore: number;
        roleCompany: string | null;
      }>;
    };
    try {
      const text = response.text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return { success: false };
    }

    const searchText =
      parsed.narrative + " " + parsed.claims.map((c) => c.text).join(" ");

    await ctx.runMutation(internal.profiles.saveNarrativeInternal, {
      profileId: args.profileId,
      narrativeMarkdown: parsed.narrative,
      searchText,
    });

    // Map company names to role IDs
    const companyToRoleId = new Map<string, string>();
    for (const role of roles) {
      companyToRoleId.set(role.company.toLowerCase(), role._id);
    }

    const validClaimTypes = ["outcome", "skill", "responsibility", "achievement"];
    const mappedClaims = parsed.claims.map((c) => {
      let roleId: string | undefined;
      if (c.roleCompany) {
        for (const [company, id] of companyToRoleId.entries()) {
          if (
            company.includes(c.roleCompany.toLowerCase()) ||
            c.roleCompany.toLowerCase().includes(company)
          ) {
            roleId = id;
            break;
          }
        }
      }
      const claimType = validClaimTypes.includes(c.claimType)
        ? c.claimType
        : "achievement";
      return {
        roleId: roleId as never,
        text: c.text,
        claimType: claimType as "outcome" | "skill" | "responsibility" | "achievement",
        confidenceScore: Math.min(1, Math.max(0, c.confidenceScore)),
      };
    });

    await ctx.runMutation(internal.claims.createClaimsInternal, {
      profileId: args.profileId,
      claims: mappedClaims,
    });

    await ctx.runMutation(internal.interview.completeSession, {
      sessionId: args.sessionId,
    });

    return { success: true };
  },
});

export const generateReferenceSummary = action({
  args: {
    sessionId: v.id("interviewSessions"),
    referenceId: v.id("references"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.interview.getSessionInternal, {
      sessionId: args.sessionId,
    });
    const reference = await ctx.runQuery(internal.references.getByReferenceId, {
      referenceId: args.referenceId,
    });

    if (!session || !reference) return { success: false };

    const formattedTranscript = session.transcript
      .map((t) => `${t.role}: ${t.content}`)
      .join("\n");

    const prompt = `Summarize what ${reference.name} said about the candidate in 2-4 sentences. Focus on specific contributions and strengths. Be concrete. Transcript: ${formattedTranscript}`;

    const response = await ctx.runAction(internal.openai.generateText, {
      prompt,
      model: "gpt-4o",
      temperature: 0.3,
    });

    await ctx.runMutation(internal.references.saveInterviewSummaryInternal, {
      referenceId: args.referenceId,
      summary: response.text.trim(),
    });

    return { success: true };
  },
});
