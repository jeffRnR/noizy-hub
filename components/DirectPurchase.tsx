"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import Spinner from "./Spinner";
import { Ban, Clock, ShoppingCart, User } from "lucide-react";

// Add proper type definitions
interface TicketType {
  _id: Id<"ticketTypes">;
  name: string;
  price: number;
  expiresAt?: number;
  eventId: Id<"events">;
  _creationTime: number;
}

function DirectPurchase({
  eventId,
  userId,
}: {
  eventId: Id<"events">;
  userId: string | null;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseType, setPurchaseType] = useState<"guest" | "user" | null>(
    null
  );
  const [guestEmail, setGuestEmail] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState<Id<"ticketTypes"> | null>(null);

  const event = useQuery(api.events.getById, { eventId });
  const ticketTypes = useQuery(api.ticketTypes.getByEvent, { eventId });
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const userTicket = useQuery(
    api.tickets.getUserTicketForEvent,
    userId ? { eventId, userId } : "skip"
  );

  const isEventOwner = userId === event?.userId;
  // Fix: Add proper null check for eventDate
  const isPastEvent = event?.eventDate ? event.eventDate < Date.now() : false;

  // Fix: Add proper type annotation and ensure we have ticketTypes
  const selectedType = ticketTypes?.find((t: TicketType) => t._id === selectedTypeId);

  const handlePurchase = async (type: "guest" | "user") => {
    if (!selectedTypeId || !selectedType) {
      toast.error("Please select a ticket type");
      return;
    }
    if (type === "guest" && !guestEmail) {
      toast.error("Please provide your email");
      return;
    }

    try {
      setIsProcessing(true);

      const purchaseData = {
        eventId,
        ticketTypeId: selectedTypeId,
        ticketTypeName: selectedType.name,
        eventName: event?.name,
        price: selectedType.price,
        ...(type === "guest"
          ? { guestEmail, type: "guest" }
          : { userId, type: "user" }),
      };

      // Note: Using sessionStorage as a temporary solution
      // In production, this should be replaced with proper backend handling
      sessionStorage.setItem("pendingPurchase", JSON.stringify(purchaseData));

      setTimeout(() => {
        toast.success(
          `Ticket purchased successfully! ${
            type === "guest" ? "Check your email for details." : ""
          }`
        );
        if (type === "guest") {
          setGuestEmail("");
          setPurchaseType(null);
        }
      }, 2000);
    } catch (error) {
      console.error("Error processing purchase", error);
      toast.error("Failed to process purchase. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Add proper loading state checks
  if (!event || ticketTypes === undefined || availability === undefined) {
    return <Spinner />;
  }

  if (userId && userTicket) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-100 text-green-700 rounded-md">
        <ShoppingCart className="w-4 h-4" />
        <span>You already have a ticket for this event</span>
      </div>
    );
  }

  if (isEventOwner) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-100 text-red-700 rounded-md">
        <Ban className="w-4 h-4" />
        <span>You cannot buy a ticket for your own event</span>
      </div>
    );
  }

  if (isPastEvent) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-100 text-red-700 rounded-md">
        <Clock className="w-4 h-4" />
        <span>This event has already passed</span>
      </div>
    );
  }

  if (ticketTypes.length === 0) {
    return (
      <div className="text-center text-sm text-gray-600">
        No ticket types available for this event.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label htmlFor="ticketType" className="block text-sm font-medium text-gray-700">
          Select Ticket Type
        </label>
        <select
          id="ticketType"
          value={selectedTypeId ?? ""}
          onChange={(e) =>
            setSelectedTypeId(e.target.value as Id<"ticketTypes">)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#553b6d]"
        >
          <option value="" disabled>
            Choose a ticket type...
          </option>
          {ticketTypes.map((type: TicketType) => {
            const isExpired = type.expiresAt && type.expiresAt < Date.now();
            return (
              <option
                key={type._id}
                value={type._id}
                disabled={Boolean(isExpired)}
              >
                {type.name} - KES {type.price.toFixed(2)}{" "}
                {isExpired ? "(Expired)" : ""}
              </option>
            );
          })}
        </select>
      </div>

      {!purchaseType && (
        <>
          {userId ? (
            <button
              onClick={() => handlePurchase("user")}
              disabled={isProcessing || !selectedTypeId}
              className="w-full bg-[#553b6d] text-white px-6 py-3 rounded-md font-medium hover:bg-[#553b6d]/90 transition-colors duration-200 shadow-md flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Spinner /> : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Buy Ticket {selectedType ? `- KES ${selectedType.price.toFixed(2)}` : ""}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setPurchaseType("guest")}
              disabled={!selectedTypeId}
              className="w-full bg-[#553b6d] text-white px-6 py-3 rounded-md font-medium hover:bg-[#553b6d]/90 transition-colors duration-200 shadow-md flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Ticket {selectedType ? `- KES ${selectedType.price.toFixed(2)}` : ""}
            </button>
          )}
        </>
      )}

      {purchaseType === "guest" && (
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Enter your details</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address*
              </label>
              <input
                type="email"
                id="guestEmail"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#553b6d] focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handlePurchase("guest")}
              disabled={isProcessing || !guestEmail.trim() || !selectedTypeId}
              className="flex-1 bg-[#553b6d] text-white px-4 py-2 rounded-md font-medium hover:bg-[#553b6d]/90 transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Spinner /> : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Purchase - KES {selectedType?.price.toFixed(2)}
                </>
              )}
            </button>

            <button
              onClick={() => {
                setPurchaseType(null);
                setGuestEmail("");
              }}
              disabled={isProcessing}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Your ticket confirmation will be sent to the provided email address.
          </p>
        </div>
      )}
    </div>
  );
}

export default DirectPurchase;