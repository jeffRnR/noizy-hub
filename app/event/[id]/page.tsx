"use client";

import Spinner from "@/components/Spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import EventCard from "@/components/EventCard";
import Button from "@/components/Button";
import JoinQueue from "@/components/JoinQueue";

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
                      <MapPin className="w-5 h-5 mr-2 text-[#7adb78]" />
                      <span className="text-sm forn medium">Location</span>
                    </div>
                    <p className="text-gray-900">{event.location}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Ticket className="w-5 h-5 mr-2 text-[#7adb78]" />
                      <span className="text-sm forn medium">Price</span>
                    </div>
                    <p className="text-gray-900">
                      KES {event.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Users className="w-5 h-5 mr-2 text-[#7adb78]" />
                      <span className="text-sm forn medium">Availability</span>
                    </div>
                    <p className="text-gray-900">
                      {availability.totalTickets - availability.purchasedCount}{" "}
                      / {availability.totalTickets} left
                    </p>
                  </div>
                </div>

                {/* additional event information */}
                {/* <div className="bg-[#553b6d]/10 border border[#553b6d]/20 rounded-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Information</h3>
                    <ul className="space-y-2 text-[#553b6d]">
                        <li>* Tickets are non-refundable</li>
                        <li>* No food or drinks from outside</li>
                        <li>* Age restriction: 21+</li>
                    </ul>
                </div> */}
              </div>

              {/* right column - ticket purchase card */}
              <div>
                <div className="sticky top-8 space-y-4">
                    <EventCard  eventId={params.id as Id<"events">} />

                    {user ? (
                        <JoinQueue 
                            eventId={params.id as Id<"events">}
                            userId={user.id}
                        />
                    ) : (
                        <SignInButton>
                            <Button className="w-full">
                                Sign in to buy tickets
                            </Button>
                        </SignInButton>
                    )}
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
