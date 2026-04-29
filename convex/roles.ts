import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRolesFromResume = mutation({
  args: {
    profileId: v.id("profiles"),
    roles: v.array(
      v.object({
        title: v.string(),
        company: v.string(),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        isCurrent: v.boolean(),
        summary: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = await Promise.all(
      args.roles.map((role, index) =>
        ctx.db.insert("roles", {
          profileId: args.profileId,
          title: role.title,
          company: role.company,
          startDate: role.startDate,
          endDate: role.endDate,
          isCurrent: role.isCurrent,
          summary: role.summary,
          sortOrder: index,
        })
      )
    );
    return ids;
  },
});

export const getRoles = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roles")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .order("asc")
      .collect();
  },
});

export const getRolesInternal = internalQuery({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roles")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .order("asc")
      .collect();
  },
});
