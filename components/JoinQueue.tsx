"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Underdog } from "next/font/google";
import { toast } from "sonner";
import Spinner from "./Spinner";
import { WAITING_LIST_STATUS } from "@/convex/constants";
import { Ban, Clock, Octagon } from "lucide-react";

function JoinQueue({
  eventId,
  userId,
}: {
  eventId: Id<"events">;
  userId: string;
}) {
  const joinWaitingList = useMutation(api.events.joinWaitingList);
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });

  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId,
  });
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const event = useQuery(api.events.getById, { eventId });

  const isEventOwner = userId === event?.userId;

  const handleJoinQueue = async () => {
    try {
      const result = await joinWaitingList({ eventId, userId });
      if (result.success) {
        console.log("Successfully joined waiting list");
        toast.message(result.message, {
          duration: 5000,
        });
      }
    } catch (error) {
      if (
        error instanceof ConvexError &&
        error.message.includes("joined the waiting list too many times")
      ) {
        toast.error("Slow down there! " + error.data, {
          duration: 5000,
        });
      } else {
        console.error("Error joining waiting list", error);
        toast.error(
          "Oh no! Something went wrong. Failed to join queue. Please try again later."
        );
      }
    }
  };

  if (queuePosition === undefined || availability === undefined || !event) {
    return <Spinner />;
  }

  if (userTicket) {
    return null;
  }

  const isPastEvent = event.eventDate < Date.now();

  return (
    <div>
      {(!queuePosition ||
        queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
        (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
          queuePosition.offerExpiresAt &&
          queuePosition.offerExpiresAt <= Date.now())) && (
        <>
          {isEventOwner ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-100 text-red-700 rounded-md">
              <Ban className="w-4 h-4 text-red-700" />
              <span>You cannot buy a ticket for your own event</span>
            </div>
          ) : isPastEvent ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-100 text-red-700 rounded-md">
              <Clock className="w-4 h-4 text-red-700" />
              <span>This is a past event</span>
            </div>
          ) : availability.purchasedCount >= availability?.totalTickets ? (
            <div>
              <p>Sorry, this event is sold out</p>
            </div>
          ) : (
            <button
              onClick={handleJoinQueue}
              disabled={isPastEvent || isEventOwner}
              className="w-full bg-[#553b6d] text-white px-6 py-3 rounded-md font-medium
              hover:bg-[#553b6d]/80 transition-colors duration-200 shadow-md flex items-center justify-center 
              disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Buy Ticket
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default JoinQueue;
