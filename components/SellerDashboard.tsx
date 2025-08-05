'use client';

import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

type Event = {
  id: string;
  name: string;
  date: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  rsvpCount: number;
  attendanceRate: number;
};

function SellerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [hasEvent, setHasEvent] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', totalTickets: 0 });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const fetchedEvent: Event | null = {
        id: 'abc123',
        name: 'Noizy Movie Night',
        date: '2025-10-10',
        ticketsSold: 124,
        totalTickets: 200,
        revenue: 49600,
        rsvpCount: 150,
        attendanceRate: 82.7,
      };

      if (fetchedEvent) {
        setEvent(fetchedEvent);
        setHasEvent(true);
      }
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    // Save event logic here
    console.log('Creating event:', form);
    setHasEvent(true);
    setEvent({
      id: 'new123',
      name: form.name,
      date: form.date,
      ticketsSold: 0,
      totalTickets: form.totalTickets,
      revenue: 0,
      rsvpCount: 0,
      attendanceRate: 0,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!hasEvent) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <h2 className="text-xl font-bold mb-4">Create Your First Event</h2>
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Event Name"
            className="w-full p-2 border rounded"
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="date"
            className="w-full p-2 border rounded"
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="totalTickets"
            placeholder="Total Tickets"
            className="w-full p-2 border rounded"
            onChange={handleInputChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            Create Event
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard for: {event?.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Revenue</h2>
          <p className="text-2xl mt-2">Ksh {event?.revenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Tickets Sold</h2>
          <p className="text-2xl mt-2">{event?.ticketsSold}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Tickets Remaining</h2>
          <p className="text-2xl mt-2">
            {event && event.totalTickets - event.ticketsSold}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Total RSVPs</h2>
          <p className="text-2xl mt-2">{event?.rsvpCount}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Attendance Rate</h2>
          <p className="text-2xl mt-2">{event?.attendanceRate}%</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Event Date</h2>
          <p className="text-2xl mt-2">{event?.date}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Vendor Access</h2>
        <p className="text-gray-700">Access and manage items sold by vendors participating in your event.</p>
        <button className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
          View Vendor Items
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Edit Event Details</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Edit Event
        </button>
      </div>
    </div>
  );
}

export default SellerDashboard;
