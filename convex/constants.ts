import { Doc } from "./_generated/dataModel";

export const DURATIONS = {
    TICKET_OFFER: 30 * 60 * 1000, //stripe uses 30 mins to checkout or the ticket is expired
} as const;

export const WAITING_LIST_STATUS: Record<string, Doc<"waitingList">["status"]> = {
    WAITING: "waiting",
    OFFERED: "offered",
    PURCHASED: "purchased",
    EXPIRED: "expired",
} as const;

export const TICKET_STATUS: Record<string, Doc<"tickets">["status"]> = {
    VALID: "valid",
    USED: "used",
    REFUNDED: "refunded",
    CAMCELLED: "cancelled"
} as const