import { mutation, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";
import { internal } from "./_generated/api";

export const getQueuePosition = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const entry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
      .first();

    if (!entry) return null;

    const peopleAhead = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.and(
          q.lt(q.field("_creationTime"), entry._creationTime),
          q.or(
            q.eq(q.field("status"), WAITING_LIST_STATUS.WAITING),
            q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED)
          )
        )
      )
      .collect()
      .then((entries) => entries.length);

    return {
      ...entry,
      position: peopleAhead + 1,
    };
  },
});

// Extract core queue logic
async function processQueueLogic(ctx: any, { eventId }: { eventId: any }) {
  const event = await ctx.db.get(eventId);
  if (!event) throw new Error("Event not found");

  // Fetch ticket types for event
  const ticketTypes = await ctx.db
    .query("ticketTypes")
    .withIndex("by_event", (q: any) => q.eq("eventId", eventId))
    .collect();

  const totalTickets = ticketTypes.reduce(
    (sum: number, t: any) => sum + t.totalQuantity,
    0
  );

  const tickets = await ctx.db
    .query("tickets")
    .withIndex("by_event", (q: any) => q.eq("eventId", eventId))
    .collect();

  const purchasedCount = tickets.filter(
    (t: any) =>
      t.status === TICKET_STATUS.VALID || t.status === TICKET_STATUS.USED
  ).length;

  const now = Date.now();
  const activeOffers = await ctx.db
    .query("waitingList")
    .withIndex("by_event_status", (q: any) =>
      q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
    )
    .collect()
    .then((entries: any[]) =>
      entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
    );

  const availableSpots = totalTickets - (purchasedCount + activeOffers);

  if (availableSpots <= 0) return;

  const waitingUsers = await ctx.db
    .query("waitingList")
    .withIndex("by_event_status", (q: any) =>
      q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.WAITING)
    )
    .order("asc")
    .take(availableSpots);

  for (const user of waitingUsers) {
    await ctx.db.patch(user._id, {
      status: WAITING_LIST_STATUS.OFFERED,
      offerExpiresAt: now + DURATIONS.TICKET_OFFER,
    });

    await ctx.scheduler.runAfter(
      DURATIONS.TICKET_OFFER,
      internal.waitingList.expireOffer,
      {
        waitingListId: user._id,
        eventId,
      }
    );
  }
}

export const processQueue = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    await processQueueLogic(ctx, { eventId });
  },
});

export const expireOffer = internalMutation({
  args: {
    waitingListId: v.id("waitingList"),
    eventId: v.id("events"),
  },
  handler: async (ctx, { waitingListId, eventId }) => {
    const offer = await ctx.db.get(waitingListId);
    if (!offer || offer.status !== WAITING_LIST_STATUS.OFFERED) return;

    await ctx.db.patch(waitingListId, {
      status: WAITING_LIST_STATUS.EXPIRED,
    });

    await processQueueLogic(ctx, { eventId });
  },
});

export const releaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    waitingListId: v.id("waitingList"),
  },
  handler: async (ctx, { eventId, waitingListId }) => {
    const entry = await ctx.db.get(waitingListId);
    if (!entry || entry.status !== WAITING_LIST_STATUS.OFFERED) {
      throw new Error("No valid ticket offer found");
    }

    await ctx.db.patch(waitingListId, {
      status: WAITING_LIST_STATUS.EXPIRED,
    });

    await processQueueLogic(ctx, { eventId });
  },
});
