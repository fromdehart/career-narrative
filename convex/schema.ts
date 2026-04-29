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
