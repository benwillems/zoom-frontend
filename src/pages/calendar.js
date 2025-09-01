import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ReactBigCalendar from "@/components/ui/Calendar/ReactBigCalendar";

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("");
  useEffect(() => {
    // Check if user is connected to Microsoft
    const checkMicrosoftConnection = async () => {
      try {
        const response = await fetch("/api/auth/microsoft/status");
        const data = await response.json();

        if (data.connected) {
          setConnectionStatus(
            `Connected to Microsoft Calendar${
              data.email ? ` (${data.email})` : ""
            }`
          );
        }
      } catch (error) {
        console.error("Error checking Microsoft connection:", error);
      }
    };

    // Fetch calendar events
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/appointments");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkMicrosoftConnection();
    fetchEvents();
  }, [router.query, router]);

  return (
    <div className="container mx-auto p-4">
      {connectionStatus && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {connectionStatus}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading calendar...</p>
        </div>
      ) : (
        <ReactBigCalendar
          events={events}
          fetchAllAppointments={() => fetchEvents()}
        />
      )}
    </div>
  );
}
