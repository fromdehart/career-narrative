import { action, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const startSession = mutation({
  args: {
    profileId: v.id("profiles"),
    sessionType: v.union(v.literal("candidate"), v.literal("reference")),
    referenceId: v.optional(v.id("references")),
    mode: v.union(v.literal("voice"), v.literal("text")),
    systemContext: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("interviewSessions", {
      profileId: args.profileId,
      sessionType: args.sessionType,
      referenceId: args.referenceId,
      transcript: [],
      status: "active",
      mode: args.mode,
      systemContext: args.systemContext,
      createdAt: Date.now(),
    });
    return { sessionId };
  },
});

export const addMessage = mutation({
  args: {
    sessionId: v.id("interviewSessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return;
    await ctx.db.patch(args.sessionId, {
      transcript: [
        ...session.transcript,
        { role: args.role, content: args.content, timestamp: Date.now() },
      ],
    });
  },
});

export const getSession = query({
  args: { sessionId: v.id("interviewSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

export const getSessionInternal = internalQuery({
  args: { sessionId: v.id("interviewSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

export const getNextQuestion = action({
  args: { sessionId: v.id("interviewSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.interview.getSessionInternal, {
      sessionId: args.sessionId,
    });
    if (!session) return { question: "Tell me about your career." };

    const formatted = session.transcript
      .map((t) => `${t.role}: ${t.content}`)
      .join("\n");

    const response = await ctx.runAction(internal.openai.generateText, {
      systemPrompt:
        "You are a career interviewer. Ask ONE targeted follow-up question. Be specific — ask for numbers, the candidate's personal contribution, or concrete outcomes. Do not repeat what was already covered. Output ONLY the question, nothing else.",
      prompt: formatted || "Start the interview by introducing yourself briefly and asking the candidate to walk you through their most recent role.",
      model: "gpt-4o",
      temperature: 0.7,
    });

    return { question: response.text.trim() };
  },
});

export const getRealtimeEphemeralKey = action({
  args: { sessionId: v.id("interviewSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.interview.getSessionInternal, {
      sessionId: args.sessionId,
    });

    const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        instructions: session?.systemContext ?? "",
      }),
    });

    const data = (await res.json()) as {
      client_secret: { value: string };
    };
    return { ephemeralKey: data.client_secret.value };
  },
});

export const completeSession = mutation({
  args: { sessionId: v.id("interviewSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});
