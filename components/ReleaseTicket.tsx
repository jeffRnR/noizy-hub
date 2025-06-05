"use client";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { Circle, XCircle } from "lucide-react";

function ReleaseTicket({
  eventId,
  waitingListId,
}: {
  eventId: Id<"events">;
  waitingListId: Id<"waitingList">;
}) {
  const [isReleasing, setIsReleasing] = useState(false);
  const releaseTicket = useMutation(api.waitingList.releaseTicket);

  const handleRelease = async () => {
    if (!confirm("Are you sure you want to release your ticket offer?")) return;
    try {
        setIsReleasing(true);
        await releaseTicket({
            eventId,
            waitingListId,
        })
    } catch (error) {
        console.error("Error releasing ticket: ", error);
    }finally{
        setIsReleasing(false)
    }
  }
  return (
    <button
        onClick={handleRelease}
        disabled={isReleasing}
        className="mt-2 w-full items-center justify-content gap-2 py-2 bg-red-100
        text-red-700 rounded-md hover:ng-red-200 transition disabled:opacity-50
        disabled:cursor-not-allowed"
    >
        <Circle className="w-4 h-4" />
        {isReleasing ? "Releasing..." : "Release Ticket Offer"}

    </button>
  );
}

export default ReleaseTicket;
