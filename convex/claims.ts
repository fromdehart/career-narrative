import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createClaims = mutation({
  args: {
    profileId: v.id("profiles"),
    claims: v.array(
      v.object({
        roleId: v.optional(v.id("roles")),
        text: v.string(),
        claimType: v.union(
          v.literal("outcome"),
          v.literal("skill"),
          v.literal("responsibility"),
          v.literal("achievement")
        ),
        confidenceScore: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.claims.map((claim, index) =>
        ctx.db.insert("claims", {
          profileId: args.profileId,
          roleId: claim.roleId,
          text: claim.text,
          claimType: claim.claimType,
          confidenceScore: claim.confidenceScore,
          isVisible: true,
          sortOrder: index,
        })
      )
    );
  },
});

export const getClaims = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("claims")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .order("asc")
      .collect();
  },
});

export const getClaimsInternal = internalQuery({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("claims")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .order("asc")
      .collect();
  },
});

export const createClaimsInternal = internalMutation({
  args: {
    profileId: v.id("profiles"),
    claims: v.array(
      v.object({
        roleId: v.optional(v.id("roles")),
        text: v.string(),
        claimType: v.union(
          v.literal("outcome"),
          v.literal("skill"),
          v.literal("responsibility"),
          v.literal("achievement")
        ),
        confidenceScore: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.claims.map((claim, index) =>
        ctx.db.insert("claims", {
          profileId: args.profileId,
          roleId: claim.roleId,
          text: claim.text,
          claimType: claim.claimType,
          confidenceScore: claim.confidenceScore,
          isVisible: true,
          sortOrder: index,
        })
      )
    );
  },
});

export const toggleVisibility = mutation({
  args: { claimId: v.id("claims"), isVisible: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.claimId, { isVisible: args.isVisible });
  },
});

export const updateText = mutation({
  args: { claimId: v.id("claims"), text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.claimId, { text: args.text });
  },
});
