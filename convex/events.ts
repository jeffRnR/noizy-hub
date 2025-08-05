import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";
import { internal } from "./_generated/api";

// Define ticket type interface for better type safety
interface TicketType {
  id: string;
  name: string;
  price: number;
  totalQuantity: number;
}

// Get all active events
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();
  },
});

// Get specific event by ID
export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

// Get availability for a given event
export const getEventAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Type assertion or safe access for ticketTypes
    const ticketTypes = (event as any).ticketTypes as TicketType[] || [];
    const totalTickets = ticketTypes.reduce((sum: number, t: TicketType) => sum + t.totalQuantity, 0);

    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then((tickets) =>
        tickets.filter(
          (t) => t.status === TICKET_STATUS.VALID || t.status === TICKET_STATUS.USED
        ).length
      );

    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then((entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length);

    const totalReserved = purchasedCount + activeOffers;

    return {
      isSoldOut: totalReserved >= totalTickets,
      totalTickets,
      purchasedCount,
      activeOffers,
      remainingTickets: Math.max(0, totalTickets - totalReserved),
    };
  },
});

// Internal helper
async function checkTicketAvailability(ctx: any, eventId: string) {
  const event = await ctx.db.get(eventId);
  if (!event) throw new Error("Event not found");

  const ticketTypes = (event as any).ticketTypes as TicketType[] || [];
  const totalTickets = ticketTypes.reduce((sum: number, t: TicketType) => sum + t.totalQuantity, 0);

  const purchasedCount = await ctx.db
    .query("tickets")
    .withIndex("by_event", (q: any) => q.eq("eventId", eventId))
    .collect()
    .then((tickets: any[]) =>
      tickets.filter(
        (t) => t.status === TICKET_STATUS.VALID || t.status === TICKET_STATUS.USED
      ).length
    );

  const now = Date.now();
  const activeOffers = await ctx.db
    .query("waitingList")
    .withIndex("by_event_status", (q: any) =>
      q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
    )
    .collect()
    .then((entries: any[]) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length);

  const availableSpots = totalTickets - (purchasedCount + activeOffers);

  return {
    available: availableSpots > 0,
    availableSpots,
    totalTickets,
    purchasedCount,
    activeOffers,
  };
}

// Public check
export const checkAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await checkTicketAvailability(ctx, eventId);
  },
});

// Join waiting list
export const joinWaitingList = mutation({
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }) => {
    const existingEntry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
      .first();

    if (existingEntry) {
      throw new Error("Already in waiting list for this event");
    }

    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    const { available } = await checkTicketAvailability(ctx, eventId);

    const now = Date.now();

    if (available) {
      const waitingListId = await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.OFFERED,
        offerExpiresAt: now + DURATIONS.TICKET_OFFER,
      });

      await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER,
        internal.waitingList.expireOffer,
        {
          waitingListId,
          eventId,
        }
      );
    } else {
      await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.WAITING,
      });
    }

    return {
      success: true,
      status: available ? WAITING_LIST_STATUS.OFFERED : WAITING_LIST_STATUS.WAITING,
      message: available
        ? `Ticket offered - you have ${DURATIONS.TICKET_OFFER / (60 * 1000)} minutes to purchase`
        : "Added to waiting list - you'll be notified when a ticket becomes available",
    };
  },
});

// Get events by user
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("events")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Track ticket sales trend
export const getTicketSalesTrend = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    const grouped = tickets.reduce((acc: Record<string, number>, ticket) => {
      const date = new Date(ticket._creationTime).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      sales: count,
    }));
  },
});

// Get event stats
export const getEventStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    const ticketTypes = (event as any).ticketTypes as TicketType[] || [];
    const totalTickets = ticketTypes.reduce((sum: number, t: TicketType) => sum + t.totalQuantity, 0);
    const averagePrice =
      ticketTypes.reduce((sum: number, t: TicketType) => sum + t.price, 0) / ticketTypes.length || 0;

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    const validTickets = tickets.filter(
      (t) => t.status === TICKET_STATUS.VALID || t.status === TICKET_STATUS.USED
    );

    const revenue = validTickets.length * averagePrice;

    return {
      totalTickets,
      sold: validTickets.length,
      remaining: totalTickets - validTickets.length,
      revenue,
    };
  },
});