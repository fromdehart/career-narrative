import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createProfile = mutation({
  args: { anonymousId: v.string() },
  handler: async (ctx, args) => {
    const shareToken = crypto.randomUUID();
    const now = Date.now();
    const profileId = await ctx.db.insert("profiles", {
      anonymousId: args.anonymousId,
      status: "uploading",
      visibility: "private",
      shareToken,
      createdAt: now,
      updatedAt: now,
    });
    return { profileId, shareToken };
  },
});

export const getProfile = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.profileId);
  },
});

export const getProfileInternal = internalQuery({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.profileId);
  },
});

export const getProfileByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_shareToken", (q) => q.eq("shareToken", args.shareToken))
      .first();
    if (!profile || profile.visibility !== "public") return null;
    return profile;
  },
});

export const updateStatus = mutation({
  args: {
    profileId: v.id("profiles"),
    status: v.union(
      v.literal("uploading"),
      v.literal("parsing"),
      v.literal("interviewing"),
      v.literal("generating"),
      v.literal("evidence"),
      v.literal("references"),
      v.literal("published")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, { status: args.status, updatedAt: Date.now() });
  },
});

export const saveResumeText = mutation({
  args: { profileId: v.id("profiles"), resumeText: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      resumeText: args.resumeText,
      status: "parsing",
      updatedAt: Date.now(),
    });
  },
});

export const saveNarrativeInternal = internalMutation({
  args: {
    profileId: v.id("profiles"),
    narrativeMarkdown: v.string(),
    searchText: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      narrativeMarkdown: args.narrativeMarkdown,
      searchText: args.searchText,
      status: "evidence",
      updatedAt: Date.now(),
    });
  },
});

export const saveNarrative = mutation({
  args: {
    profileId: v.id("profiles"),
    narrativeMarkdown: v.string(),
    searchText: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      narrativeMarkdown: args.narrativeMarkdown,
      searchText: args.searchText,
      status: "evidence",
      updatedAt: Date.now(),
    });
  },
});

export const setVisibility = mutation({
  args: {
    profileId: v.id("profiles"),
    visibility: v.union(v.literal("public"), v.literal("private")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      visibility: args.visibility,
      updatedAt: Date.now(),
    });
  },
});

export const setEmail = mutation({
  args: {
    profileId: v.id("profiles"),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      email: args.email,
      name: args.name,
      updatedAt: Date.now(),
    });
  },
});
