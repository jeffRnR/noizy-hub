// convex/ticketTypes.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ticketTypes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});