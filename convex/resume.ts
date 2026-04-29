import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const parseResumeToRoles = action({
  args: { resumeText: v.string() },
  handler: async (ctx, args) => {
    const prompt = `Extract all work experience roles from this resume. Return ONLY valid JSON: { "roles": [{ "title": string, "company": string, "startDate": "YYYY-MM" | null, "endDate": "YYYY-MM" | null, "isCurrent": boolean, "summary": string }] }. Set isCurrent=true when end date is missing or says 'present'. Summary: 1-2 sentences describing the role's focus. Resume: ${args.resumeText}`;

    const response = await ctx.runAction(internal.openai.generateText, {
      prompt,
      model: "gpt-4o",
      temperature: 0,
    });

    try {
      const text = response.text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as {
        roles: Array<{
          title: string;
          company: string;
          startDate: string | null;
          endDate: string | null;
          isCurrent: boolean;
          summary: string;
        }>;
      };
      return { roles: parsed.roles ?? [] };
    } catch {
      return { roles: [] };
    }
  },
});
