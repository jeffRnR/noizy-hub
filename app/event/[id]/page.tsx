"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Spinner from "@/components/Spinner";
import DirectPurchase from "@/components/DirectPurchase";
import JoinQueue from "@/components/JoinQueue";
import { CalendarDays, MapPin, User, Clock } from "lucide-react";

interface EventPageProps {
  params: {
    id: string;
  };
}

function EventPage({ params }: EventPageProps) {
  const { user } = useUser();
  
  // Validate and convert the ID
  const eventId = params.id as Id<"events">;
  
  // Validate that we have a proper eventId before making queries
  if (!eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Event</h1>
          <p className="text-gray-600">The event ID provided is not valid.</p>
        </div>
      </div>
    );
  }

  const event = useQuery(api.events.getById, { eventId });
  const availability = useQuery(api.events.getEventAvailability, { eventId });

  // Handle loading state
  if (event === undefined || availability === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Handle event not found
  if (event === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isEventOwner = user?.id === event.userId;
  const isPastEvent = event.eventDate < Date.now();
  const eventDate = new Date(event.eventDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {event.imageStorageId && (
            <div className="w-full h-64 bg-gray-200">
              {/* Add your image component here */}
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Event Image
              </div>
            </div>
          )}
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarDays className="w-5 h-5" />
                <span>{eventDate.toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{event.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-5 h-5" />
                <span>Organized by {isEventOwner ? 'You' : 'Event Organizer'}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">About this event</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>

            {/* Event Status */}
            {event.is_cancelled && (
              <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium">This event has been cancelled.</p>
              </div>
            )}

            {isPastEvent && !event.is_cancelled && (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-gray-800 font-medium">This event has already taken place.</p>
              </div>
            )}

            {/* Ticket Availability */}
            {availability && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Ticket Availability</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Available: </span>
                    <span className="font-medium">{availability.totalTickets - availability.purchasedCount}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Sold: </span>
                    <span className="font-medium">{availability.purchasedCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Purchase/Queue Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get Your Ticket</h2>
          
          {!event.is_cancelled && !isPastEvent && (
            <div className="space-y-6">
              <DirectPurchase eventId={eventId} userId={user?.id || null} />
              
              <div className="border-t pt-6">
                <JoinQueue eventId={eventId} userId={user?.id || null} />
              </div>
            </div>
          )}
          
          {(event.is_cancelled || isPastEvent) && (
            <div className="text-center py-8 text-gray-500">
              <p>Ticket purchases are not available for this event.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventPage;