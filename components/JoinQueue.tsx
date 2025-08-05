"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { toast } from "sonner";
import Spinner from "./Spinner";
import { WAITING_LIST_STATUS } from "@/convex/constants";
import { Ban, Clock, ShoppingCart } from "lucide-react";

function JoinQueue({
  eventId,
  userId,
}: {
  eventId: Id<"events">;
  userId: string | null; // Allow null for non-authenticated users
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<
    string | null
  >(null);

  // Only query these if user is authenticated
  const queuePosition = useQuery(
    api.waitingList.getQueuePosition,
    userId ? { eventId, userId } : "skip"
  );

  const userTicket = useQuery(
    api.tickets.getUserTicketForEvent,
    userId ? { eventId, userId } : "skip"
  );

  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const event = useQuery(api.events.getById, { eventId });
  const ticketTypes = useQuery(api.ticketTypes.getByEvent, { eventId });

  // Use existing mutation - we'll modify the approach
  const joinWaitingList = useMutation(api.events.joinWaitingList);

  const isEventOwner = userId === event?.userId;

  const handleAuthenticatedPurchase = async () => {
    if (!userId) return;

    try {
      setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectPurchase = async () => {
    const selectedTicketType = ticketTypes?.find(
      (t) => t._id === selectedTicketTypeId
    );

    if (!guestEmail) {
      toast.error("Please provide your email");
      return;
    }

    try {
      setIsProcessing(true);
      // For now, we'll redirect to a payment page or show payment modal
      // You can integrate with Stripe, PayPal, or your preferred payment processor

      // Example: Redirect to checkout with guest info
      const checkoutData = {
        eventId,
        guestEmail,
        eventName: event?.name || "Event",
        eventPrice: selectedTicketType?.price || 0,
      };

      // Store guest info in localStorage temporarily for checkout
      localStorage.setItem("guestCheckout", JSON.stringify(checkoutData));

      // Redirect to checkout page or open payment modal
      toast.success("Redirecting to checkout...");
      // window.location.href = `/checkout/${eventId}?guest=true`;

      // For demo purposes, simulate successful purchase
      setTimeout(() => {
        toast.success(
          "Ticket purchased successfully! Check your email for details."
        );
        setShowGuestForm(false);
        setGuestEmail("");
      }, 2000);
    } catch (error) {
      console.error("Error processing purchase", error);
      toast.error("Failed to process purchase. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (availability === undefined || !event) {
    return <Spinner />;
  }

  // For authenticated users, check if they already have a ticket
  if (userId && userTicket) {
    return null;
  }

  const isPastEvent = event.eventDate < Date.now();
  const isSoldOut = availability.purchasedCount >= availability.totalTickets;

  // Show different states based on authentication and conditions
  if (isEventOwner) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-100 text-red-700 rounded-md">
        <Ban className="w-4 h-4 text-red-700" />
        <span>You cannot buy a ticket for your own event</span>
      </div>
    );
  }

  if (isPastEvent) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-100 text-red-700 rounded-md">
        <Clock className="w-4 h-4 text-red-700" />
        <span>This is a past event</span>
      </div>
    );
  }

  if (isSoldOut) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-100 text-red-700 rounded-md">
        <Ban className="w-4 h-4 text-red-700" />
        <span>Sorry, this event is sold out</span>
      </div>
    );
  }

  // For authenticated users with queue position
  if (
    userId &&
    queuePosition &&
    queuePosition.status !== WAITING_LIST_STATUS.EXPIRED &&
    !(
      queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
      queuePosition.offerExpiresAt &&
      queuePosition.offerExpiresAt <= Date.now()
    )
  ) {
    return null; // Let the existing queue system handle this
  }

  // Show purchase options
  return (
    <div className="space-y-4">
      {!showGuestForm && (
        <div className="space-y-2">
          {userId ? (
            // Authenticated user - use queue system
            <button
              onClick={handleAuthenticatedPurchase}
              disabled={isProcessing}
              className="w-full bg-[#553b6d] text-gray-200 px-6 py-3 rounded-md font-medium
              hover:bg-[#553b6d]/80 transition-colors duration-200 shadow-md flex items-center justify-center
              disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Spinner /> : "Buy Ticket"}
            </button>
          ) : (
            // Guest user - direct purchase option
            <button
              onClick={() => setShowGuestForm(true)}
              disabled={isProcessing}
              className="w-full bg-[#553b6d] text-gray-200 px-6 py-3 rounded-md font-medium
              hover:bg-[#553b6d]/80 transition-colors duration-200 shadow-md flex items-center justify-center
              disabled:bg-gray-400 disabled:cursor-not-allowed gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Ticket as Guest
            </button>
          )}
        </div>
      )}

      {showGuestForm && (
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <h3 className="font-medium text-gray-900">Guest Purchase</h3>
          <div className="space-y-3">
            {/* <div>
              <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#553b6d]"
                placeholder="Enter your full name"
                required
              />
            </div> */}
            <div>
              <label
                htmlFor="guestEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="guestEmail"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#553b6d]"
                placeholder="Enter your email"
                required
              />
            </div>

            {ticketTypes && ticketTypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket Type
                </label>
                <select
                  value={selectedTicketTypeId || ""}
                  onChange={(e) => setSelectedTicketTypeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#553b6d]"
                >
                  <option value="" disabled>
                    Select a ticket type
                  </option>
                  {ticketTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name} - KES {type.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDirectPurchase}
              disabled={isProcessing || !guestEmail || !selectedTicketTypeId}
              className="flex-1 bg-[#553b6d] text-gray-200 px-4 py-2 rounded-md font-medium
              hover:bg-[#553b6d]/80 transition-colors duration-200
              disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Spinner />
              ) : (
                `Purchase - KES ${
                  ticketTypes
                    ?.find((t) => t._id === selectedTicketTypeId)
                    ?.price.toFixed(2) || "0.00"
                }`
              )}
            </button>
            <button
              onClick={() => {
                setShowGuestForm(false);
                setGuestEmail("");
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Your ticket details will be sent to the provided email address.
          </p>
        </div>
      )}
    </div>
  );
}

export default JoinQueue;
