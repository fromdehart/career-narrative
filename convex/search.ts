import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const fullTextSearch = internalQuery({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withSearchIndex("search_narrative", (q) =>
        q.search("searchText", args.query).eq("visibility", "public")
      )
      .take(20);
  },
});

export const searchCandidates = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const profiles = await ctx.runQuery(internal.search.fullTextSearch, {
      query: args.query,
    });

    if (profiles.length === 0) return [];

    const profilesWithClaims = await Promise.all(
      profiles.map(async (profile) => {
        const claims = await ctx.runQuery(internal.claims.getClaimsInternal, {
          profileId: profile._id,
        });
        const topClaims = claims
          .filter((c) => c.isVisible)
          .slice(0, 3)
          .map((c) => c.text);
        const narrativeSnippet = (profile.narrativeMarkdown ?? "")
          .replace(/[#*_`]/g, "")
          .slice(0, 200);
        return { profile, topClaims, narrativeSnippet };
      })
    );

    const rerankList = profilesWithClaims
      .map(
        (p, i) =>
          `[${i}] ${p.profile.name ?? "Candidate"}: ${p.narrativeSnippet} | Claims: ${p.topClaims.join("; ")}`
      )
      .join("\n");

    const rerankPrompt = `Given the search query "${args.query}", rank these candidates by relevance. Return ONLY valid JSON array: [{"index": number, "score": number}] where score is 0.0-1.0. Candidates:\n${rerankList}`;

    const response = await ctx.runAction(internal.openai.generateText, {
      prompt: rerankPrompt,
      model: "gpt-4o",
      temperature: 0,
    });

    let ranked: Array<{ index: number; score: number }> = profilesWithClaims.map((_, i) => ({
      index: i,
      score: 1 - i * 0.05,
    }));
    try {
      const text = response.text.trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      ranked = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      // use default order
    }

    return ranked
      .sort((a, b) => b.score - a.score)
      .map(({ index, score }) => {
        const { profile, topClaims, narrativeSnippet } = profilesWithClaims[index];
        return {
          profileId: profile._id,
          shareToken: profile.shareToken,
          name: profile.name,
          narrativeSnippet,
          topClaims,
          score,
        };
      });
  },
});
