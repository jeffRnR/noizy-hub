"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CalendarDays,
  Check,
  CircleArrowRight,
  LoaderCircle,
  MapIcon,
  PencilIcon,
  StarIcon,
  Ticket,
  XCircle,
} from "lucide-react";
import Button from "./Button";
import PurchaseTicket from "./PurchaseTicket";

function EventCard({ eventId }: { eventId: Id<"events"> }) {
  const { user } = useUser();
  const router = useRouter();
  const event = useQuery(api.events.getById, { eventId });
  const availability = useQuery(api.events.getEventAvailability, { eventId });

  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId: user?.id ?? "",
  });

  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });

  const imageUrl = useStorageUrl(event?.imageStorageId);

  if (!event || !availability) {
    return null;
  }

  const isPastEvent = event.eventDate < Date.now();
  const isEventOwner = user?.id === event?.userId;

  const renderQueuePosition = () => {
    if (!queuePosition || queuePosition.status !== "waiting") return null;
    if (availability.purchasedCount >= availability.totalTickets) {
      return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border-gray-200">
          <div className="flex items-center">
            <Ticket className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-600">Event is sold out</span>
          </div>
        </div>
      );
    }

    if (queuePosition.position === 2) {
      return (
        <div
          className="flex flex-col lg:flex-row items-center justify-between p-3 bg-amber-50 rounded-mg border
        border-amber-100"
        >
          <div className="flex items-center">
            <CircleArrowRight className="w-4 h-4 text-amber-500 mr-2" />
            <span className="text-amber-700 fonr-medium">
              You&apos;re next in line! (Queue Position:{" "}
              {queuePosition.position})
            </span>
          </div>
          <div className="flex items-center">
            <LoaderCircle className="w-4 h-4 mr-1 animate-spin text-amber-500" />
            <span className="text-amber-600 text-sm">Waiting for ticket</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-3
      bg-[#553b6d]/10 rounded-lg border border-[#553b6d]/20">
        <div className="flex items-center">
          <LoaderCircle  className="w-4 h-4 mr-2 animate-spin text-[#553b6d]"/>
          <span className="text-[#553b6d]">Queue Position</span>
        </div>
        <span className="bg-[#553b6d]/20 text-[#553b6d] px-3 py-1 rounded-full font-medium">#{queuePosition.position}</span>
      </div>
    );
  };

  const renderTicketStatus = () => {
    if (!user) return null;
    if (isEventOwner) {
      return (
        <div className="mt-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/seller/events/${eventId}/edit`);
            }}
            className="w-full"
          >
            <div className="flex gap-2 hover:gap-3 transition-all duration-200 items-center justify-center gap-2">
              <PencilIcon className="w-4 h4" />
              <div>Edit Event</div>
            </div>
          </Button>
        </div>
      );
    }

    if (userTicket) {
      return (
        <div className="mt-4 flex items-center justify-between p-3 bg-[#7adb78]/30 rounded-md border border-[#7adb78]/60">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-700 mr-2" />
            <span className="text-green-700 font-medium">
              You have a ticket
            </span>
          </div>
          <button
            onClick={() => router.push(`/tickets/${userTicket._id}`)}
            className="text-sm bg-[#7adb78] hover:bg-[#7adb78] text-white px-3 py-1.5"
          >
            View your ticket
          </button>
        </div>
      );
    }
    if (queuePosition) {
      return (
        <div className="mt-4">
          {queuePosition.status === "offered" && (
            <PurchaseTicket eventId={eventId} />
          )}
          {renderQueuePosition()}
          {queuePosition.status === "expired" && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="text-red-700 font-medium flex items-center">
                <XCircle className="w-4 h-4 mr-2" />
                Offer expired
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      onClick={() => router.push(`/event/${eventId}`)}
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden relative ${isPastEvent ? "opacity-75 hover:opacity-100" : ""}`}
    >
      {/* event Image */}
      {imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={imageUrl}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/50
          to-transparent"
          />
        </div>
      )}

      {/* event details */}
      <div className={`p-6 ${imageUrl ? "relative" : ""}`}>
        <div className="flex justify-between items-start">
          {/* event name and owner badge */}
          <div>
            <div className="flex flex-col items-start gap-2">
              {isEventOwner && (
                <span className="inline-flex items-center gap-1 bg-[#553b6d] text-white px-2 py-1 rounded-md text-xs font-medium">
                  <StarIcon className="w-3 h-3" />
                  Your Event
                </span>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
            </div>
            {isPastEvent && (
              <span className="inline-flex itemx-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                Past Event
              </span>
            )}
          </div>
        </div>
        {/* price tag */}
        <div className="flex flex-col items-end gap-2 ml-4">
          <span
            className={`px-4 py-1.5 font-semibold rounded-md ${isPastEvent ? "bg-gray-50 text-gray-500" : "bg-[#7adb78]/30 text-green-700"}`}
          >
            KES {event.price.toFixed(2)}
          </span>
          {availability.purchasedCount >= availability.totalTickets && (
            <span className="px-4 py-1.5 bg-red-50 text-red-700 font-semibold rounded-md text-sm">
              Sold Out
            </span>
          )}
        </div>
        {/* event details */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center text-gray-600">
            <MapIcon className="w-4 h-4 mr-2" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span>
              {new Date(event.eventDate).toLocaleDateString()}{" "}
              {isPastEvent && "(Ended)"}
            </span>
          </div>

          {/* number of tickets available */}
          <div className="flex items-center text-gray-600">
            <Ticket className="w-4 h-4 mr-2" />
            <span>
              {availability.totalTickets - availability.purchasedCount} /{" "}
              {availability.totalTickets} available
              {!isPastEvent && availability.activeOffers > 0 && (
                <span className="text-amber-600 text-sm ml-2">
                  ({availability.activeOffers}{" "}
                  {availability.activeOffers === 1 ? "person" : "people"} trying
                  to buy)
                </span>
              )}
            </span>
          </div>
        </div>
        <p className="mt-4 text-gray-600 text-sm line-clamp-2">
          {event.description}
        </p>
        <div onClick={(e) => e.stopPropagation()}>
          {!isPastEvent && renderTicketStatus()}
        </div>
      </div>
    </div>
  );
}

export default EventCard;
