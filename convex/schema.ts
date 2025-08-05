import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // EVENTS
  events: defineTable({
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    userId: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    is_cancelled: v.optional(v.boolean()),
  })
    .index("by_userId", ["userId"]), // Add index to fetch all events created by a user

  // TICKET TYPES (linked to events)
  ticketTypes: defineTable({
    eventId: v.id("events"),
    name: v.string(),                 // e.g. VIP, Regular, Early Bird
    price: v.number(),
    totalQuantity: v.number(),
    expiresAt: v.optional(v.number()) // When this type is no longer available
  })
    .index("by_event", ["eventId"]),
    
  // TICKETS
  tickets: defineTable({
    eventId: v.id("events"),
    ticketTypeId: v.id("ticketTypes"),  // Link to ticket type
    userId: v.string(),
    purchasedAt: v.number(),
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    paymentIntentId: v.optional(v.string()),
    amount: v.optional(v.number()),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_payment_intent", ["paymentIntentId"]),

  // WAITING LIST
  waitingList: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("offered"),
      v.literal("purchased"),
      v.literal("expired")
    ),
    offerExpiresAt: v.optional(v.number()),
  })
    .index("by_event_status", ["eventId", "status"])
    .index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventId"]),

  // USERS
  users: defineTable({
    name: v.string(),
    email: v.string(),
    userId: v.string(),
    stripeConnectId: v.optional(v.string())
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"]),
});
