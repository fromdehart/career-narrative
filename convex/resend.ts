"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const getConfig = () => ({
  apiKey: process.env.RESEND_API_KEY!,
  from: process.env.RESEND_FROM ?? "",
});

const VOTE_MILESTONE_TO = "mdehart1@gmail.com";

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (_ctx, args) => {
    const { apiKey, from } = getConfig();
    if (!apiKey || !from) {
      return { success: false as const, error: "Missing RESEND_API_KEY or RESEND_FROM" };
    }
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from,
        to: args.to,
        subject: args.subject,
        html: args.html,
      });
      if (error) {
        return { success: false as const, error: error.message };
      }
      return { success: true as const };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false as const, error: message };
    }
  },
});

export const sendVoteTractionEmail = action({
  args: {
    challengeId: v.string(),
    count: v.number(),
  },
  handler: async (_ctx, args) => {
    const { apiKey, from } = getConfig();
    if (!apiKey || !from) {
      return { success: false as const, error: "Missing RESEND_API_KEY or RESEND_FROM" };
    }
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: VOTE_MILESTONE_TO,
        subject: "One Shot getting traction — 25 votes!",
        html: `<p>Challenge <strong>${escapeHtml(args.challengeId)}</strong> hit <strong>${args.count}</strong> votes and is getting traction!</p>`,
      });
      if (error) return { success: false as const, error: error.message };
      return { success: true as const };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false as const, error: message };
    }
  },
});

export const sendVoteMilestoneEmail = action({
  args: {
    challengeId: v.string(),
    count: v.number(),
  },
  handler: async (_ctx, args) => {
    const { apiKey, from } = getConfig();
    if (!apiKey || !from) {
      return { success: false as const, error: "Missing RESEND_API_KEY or RESEND_FROM" };
    }
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: VOTE_MILESTONE_TO,
        subject: "🚀 One Shot hit 250 votes!",
        html: `<p>Challenge <strong>${escapeHtml(args.challengeId)}</strong> hit 250 votes! Final count: <strong>${args.count}</strong>.</p>`,
      });
      if (error) return { success: false as const, error: error.message };
      return { success: true as const };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false as const, error: message };
    }
  },
});

export const sendReferenceInvite = action({
  args: {
    to: v.string(),
    candidateName: v.string(),
    inviteUrl: v.string(),
    relationship: v.string(),
  },
  handler: async (_ctx, args) => {
    const { apiKey, from } = getConfig();
    if (!apiKey || !from) {
      return { success: false as const, error: "Missing RESEND_API_KEY or RESEND_FROM" };
    }
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const subject = `${args.candidateName} invited you to be a career reference on AwesomeWork`;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1a1a1a;">You've been invited as a career reference</h2>
          <p><strong>${escapeHtml(args.candidateName)}</strong> has listed you as a <strong>${escapeHtml(args.relationship)}</strong> and would like you to share your perspective on their work as part of their career profile on AwesomeWork.</p>
          <p>AwesomeWork turns resumes into verified career narratives through voice interviews and peer references. Your responses help ${escapeHtml(args.candidateName)} tell a more authentic and compelling career story.</p>
          <p style="color: #555; font-size: 14px;">By clicking the button below, you agree that your responses in a short interview may be shared with ${escapeHtml(args.candidateName)} and included in their career profile. This is entirely voluntary — you may stop at any time.</p>
          <a href="${escapeHtml(args.inviteUrl)}" style="display: inline-block; margin-top: 16px; padding: 14px 28px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Start the Reference Interview →</a>
          <p style="margin-top: 32px; font-size: 12px; color: #888;">If you did not expect this email, you can safely ignore it.</p>
        </div>
      `;
      const { error } = await resend.emails.send({ from, to: args.to, subject, html });
      if (error) return { success: false as const, error: error.message };
      return { success: true as const };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false as const, error: message };
    }
  },
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
