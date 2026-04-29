import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createFileEvidence = mutation({
  args: {
    profileId: v.id("profiles"),
    claimId: v.id("claims"),
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("evidence", {
      profileId: args.profileId,
      claimId: args.claimId,
      evidenceType: "file",
      storageId: args.storageId,
      fileName: args.fileName,
      verificationStatus: "verified",
      isVisible: true,
      createdAt: Date.now(),
    });
  },
});

export const createUrlEvidence = mutation({
  args: {
    profileId: v.id("profiles"),
    claimId: v.id("claims"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("evidence", {
      profileId: args.profileId,
      claimId: args.claimId,
      evidenceType: "url",
      url: args.url,
      verificationStatus: "verified",
      isVisible: true,
      createdAt: Date.now(),
    });
  },
});

export const createSoftContextEvidence = mutation({
  args: {
    profileId: v.id("profiles"),
    claimId: v.id("claims"),
    context: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("evidence", {
      profileId: args.profileId,
      claimId: args.claimId,
      evidenceType: "soft_context",
      context: args.context,
      verificationStatus: "self_reported",
      isVisible: true,
      createdAt: Date.now(),
    });
  },
});

export const getEvidenceForProfile = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("evidence")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .collect();
  },
});
