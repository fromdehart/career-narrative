import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import * as telegramClient from "./telegramClient";

function getToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN;
}

export const sendMessage = action({
  args: {
    chatId: v.string(),
    message: v.string(),
    mediaUrl: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const token = getToken();
    if (!token) {
      return { success: false as const, error: "Telegram not configured" };
    }
    if (args.mediaUrl) {
      const result = await telegramClient.sendPhoto(
        token,
        args.chatId,
        args.mediaUrl
      );
      if (!result.ok) {
        return { success: false as const, error: result.error };
      }
      return { success: true as const };
    }
    const result = await telegramClient.sendMessage(
      token,
      args.chatId,
      args.message
    );
    if (!result.ok) {
      return { success: false as const, error: result.error };
    }
    return { success: true as const };
  },
});

export const storeIncoming = internalMutation({
  args: {
    chatId: v.string(),
    from: v.optional(v.any()),
    text: v.optional(v.string()),
    updateId: v.number(),
  },
  handler: async (_ctx, _args) => {
    // Telegram webhook logging disabled — events table removed
  },
});
