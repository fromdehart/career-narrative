import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const createReference = mutation({
  args: {
    profileId: v.id("profiles"),
    name: v.string(),
    email: v.string(),
    relationship: v.string(),
    linkedRoleIds: v.array(v.id("roles")),
  },
  handler: async (ctx, args) => {
    const inviteToken = crypto.randomUUID();
    const referenceId = await ctx.db.insert("references", {
      profileId: args.profileId,
      name: args.name,
      email: args.email,
      relationship: args.relationship,
      linkedRoleIds: args.linkedRoleIds,
      inviteToken,
      inviteStatus: "pending",
      isVisible: true,
      createdAt: Date.now(),
    });
    return { referenceId, inviteToken };
  },
});

export const sendInvite = action({
  args: { referenceId: v.id("references") },
  handler: async (ctx, args) => {
    const reference = await ctx.runQuery(internal.references.getByReferenceIdInternal, {
      referenceId: args.referenceId,
    });
    if (!reference) return { success: false };

    const profile = await ctx.runQuery(internal.profiles.getProfileInternal, {
      profileId: reference.profileId,
    });

    const siteUrl = process.env.SITE_URL ?? "";
    const inviteUrl = `${siteUrl}/ref/${reference.inviteToken}`;

    await ctx.runAction(internal.resend.sendReferenceInvite, {
      to: reference.email,
      candidateName: profile?.name ?? "A candidate",
      inviteUrl,
      relationship: reference.relationship,
    });

    return { success: true };
  },
});

export const getByReferenceId = query({
  args: { referenceId: v.id("references") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.referenceId);
  },
});

export const getByReferenceIdInternal = internalQuery({
  args: { referenceId: v.id("references") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.referenceId);
  },
});

export const getByInviteToken = query({
  args: { inviteToken: v.string() },
  handler: async (ctx, args) => {
    const reference = await ctx.db
      .query("references")
      .withIndex("by_inviteToken", (q) => q.eq("inviteToken", args.inviteToken))
      .first();
    if (!reference) return null;
    const profile = await ctx.db.get(reference.profileId);
    return { reference, candidateName: profile?.name ?? null };
  },
});

export const updateStatus = mutation({
  args: {
    referenceId: v.id("references"),
    status: v.union(
      v.literal("pending"),
      v.literal("viewed"),
      v.literal("consented"),
      v.literal("interviewing"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.referenceId, { inviteStatus: args.status });
  },
});

export const saveInterviewSummary = mutation({
  args: { referenceId: v.id("references"), summary: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.referenceId, {
      interviewSummary: args.summary,
      inviteStatus: "completed",
    });
  },
});

export const saveInterviewSummaryInternal = internalMutation({
  args: { referenceId: v.id("references"), summary: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.referenceId, {
      interviewSummary: args.summary,
      inviteStatus: "completed",
    });
  },
});

export const getReferencesForProfile = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("references")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .collect();
  },
});

export const toggleVisibility = mutation({
  args: { referenceId: v.id("references"), isVisible: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.referenceId, { isVisible: args.isVisible });
  },
});
