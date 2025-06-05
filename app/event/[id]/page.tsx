"use client";

import Spinner from "@/components/Spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";

function EventPage() {
  const { user } = useUser();
  const params = useParams();

  const event = useQuery(api.events.getById, {
    eventId: params.id as Id<"events">,
  });

  const availability = useQuery(api.events.getEventAvailability, {
    eventId: params.id as Id<"events">,
  });

  const imageUrl = useStorageUrl(event?.imageStorageId);

  if (!event || !availability) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* event details  */}
      <div className="max-w-7xl max-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          {/* event image */}
          {imageUrl && (
            <div className="aspect-[21/9] relative w-full">
              <Image
                src={imageUrl}
                alt={event.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* event details in depth */}
          <div className="p-8">
            <div className="grid grid-cols lg:grid-cols-2 gap-12">
              {/* left column- event details */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-5">
                    {event.name}
                  </h1>
                  <p className="text-lg text-gray-600">{event.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <CalendarDays className="w-4 h-4 mr-2 text-[#7adb78]" />
                      <span className="text-sm font-medium">Date</span>
                    </div>
                    <p className="text-gray-900">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                        <MapPin className="w-5 h-5 mr-2 text-[#7adb78]"/>
                        <span>Location</span>
                    </div>
                    <p className="text-gray-900">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventPage;
