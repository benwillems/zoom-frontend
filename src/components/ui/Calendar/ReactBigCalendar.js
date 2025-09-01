import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ScheduleEventForm from "./ScheduleEventForm";
import EventDetailsCard from "./EventDetailsCard";
import { useRef } from "react";
import useAudioStore from "@/store/useAudioStore";
import { useRouter } from "next/router";
import MicrosoftLoginModal from "./MicrosoftLoginModal.js";

const ReactBigCalendar = ({ events, fetchAllAppointments }) => {
  const localizer = momentLocalizer(moment);
  const calendarRef = useRef(null);
  const isOngoingAppointment = useAudioStore(
    (state) => state.isOngoingAppointment
  );
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [eventDetailsPosition, setEventDetailsPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showEventDetails, setShowEventDetails] = useState(false);
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showMicrosoftModal, setShowMicrosoftModal] = useState(false);
  const [isMicrosoftConnected, setIsMicrosoftConnected] = useState(false);
  // Check if Microsoft is connected using cookies
  useEffect(() => {
    const checkMicrosoftConnection = () => {
      // Read cookies to check for Microsoft connection status
      const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {});

      setIsMicrosoftConnected(cookies.ms_connected === "true");
    };

    checkMicrosoftConnection();

    // Add event listener for the custom event that will be triggered after Microsoft authentication
    const handleAuthSuccess = () => {
      checkMicrosoftConnection();
    };

    document.addEventListener("microsoft-auth-success", handleAuthSuccess);

    return () => {
      document.removeEventListener("microsoft-auth-success", handleAuthSuccess);
    };
  }, []);

  const handleMouseMove = (event) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  // Adjusts position of ScheduleEventForm & EventDetailsCard
  const adjustFormPosition = (mousePosition) => {
    if (calendarRef.current) {
      const calendarBounds = calendarRef.current.getBoundingClientRect();
      let newX, newY;

      // Check if the form, when positioned to the left of the cursor, would go out of bounds
      if (mousePosition.x - 430 < calendarBounds.left) {
        // Position form to the right of the cursor if out of bounds on the left
        newX = Math.min(mousePosition.x + 20, calendarBounds.right - 410); // Adding some space and ensuring it does not go out of bounds on the right
      } else {
        // Otherwise, position form on the left side of the cursor
        newX = Math.max(mousePosition.x - 430, calendarBounds.left);
      }

      // Positions form in relation to the vertical position of the cursor
      newY = Math.max(mousePosition.y - 140, 0);
      // Adjust if form will go out of bottom bounds
      if (newY + 300 > window.innerHeight) {
        newY = window.innerHeight - 380; // Adjust to not overflow bottom
      }

      // Apply the same position adjustments for both forms and details card
      setFormPosition({ x: newX, y: newY });
      setEventDetailsPosition({ x: newX, y: newY });
    }
  };

  const handleSelectSlot = ({ start, end }) => {
    // Use mousePosition instead of bounds
    adjustFormPosition(mousePosition);
    setSelectedEvent({
      title: "",
      description: "",
      start,
      end,
    });
    setShowForm(true);
  };

  const handleSelectEvent = (event, e) => {
    adjustFormPosition(mousePosition); // Re-use the same positioning logic
    setSelectedEvent(event);
    setShowForm(false); // Close the form if open
    setShowEventDetails(true);
  };

  const handleCancel = () => {
    setSelectedEvent(null);
    setShowForm(false);
  };

  const handleEditEvent = () => {
    setShowForm(true);
    setShowEventDetails(false); // Close details card when editing
    setFormPosition({ x: eventDetailsPosition.x, y: eventDetailsPosition.y }); // Use same position for form
  };

  const handleDeleteEvent = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const modifiedEvents = events?.map((event) => {
    if (event?.title?.trim() === "") {
      return {
        ...event,
        title: `Appointment for ${event?.client?.name || "Unknown Client"}`,
      };
    }
    return event;
  });

  const openAvailabilityForm = () => {
    router.push("/availability");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const openMicrosoftModal = () => {
    setShowMicrosoftModal(true);
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-col w-3/4 z-0" ref={calendarRef}>
      <div className="flex flex-col mt-6 mb-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Calendar</h1>
        <div className="flex justify-between mt-2 pr-2">
          <p className="text-sm pb-1">
            Add, edit, or remove appointments from the calendar
          </p>
          <div className="flex justify-center items-center p-4 gap-3">
            {/* Enhanced dropdown button */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-5 py-2.5 
                bg-blue-300 hover:bg-blue-500 
                text-gray-900 font-medium
                rounded-lg shadow-md hover:shadow-lg
                transform hover:-translate-y-0.5
                 transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span>Connect</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Calendar Integrations
                    </div>
                    <button
                      onClick={openMicrosoftModal}
                      className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 w-full text-left transition-all duration-200 group"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Microsoft
                          </div>
                        </div>
                      </div>
                      {isMicrosoftConnected ? (
                        <div className="flex items-center pl-3">
                          <span className="text-xs text-green-600 font-medium mr-2">
                            Connected
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors duration-200">
                          Click to connect
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={openAvailabilityForm}
              className="flex items-center gap-2 px-5 py-2.5 
                bg-blue-300 hover:bg-blue-500 
                text-gray-900 font-medium
                rounded-lg shadow-md hover:shadow-lg
                transform hover:-translate-y-0.5
                transition-all duration-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Availability</span>
            </button>
          </div>
        </div>
      </div>
      <div onMouseMove={handleMouseMove}>
        <Calendar
          dayLayoutAlgorithm={"no-overlap"}
          localizer={localizer}
          events={modifiedEvents}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          style={isOngoingAppointment() ? { height: 750 } : { height: 800 }}
          popup
        />
      </div>

      {showForm && (
        <ScheduleEventForm
          onCancel={handleCancel}
          initialEvent={selectedEvent}
          isOpen={showForm}
          position={formPosition}
          fetchAllAppointments={fetchAllAppointments}
        />
      )}

      {showEventDetails && !showForm && (
        <EventDetailsCard
          event={selectedEvent}
          onClose={() => setShowEventDetails(false)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          position={eventDetailsPosition}
          fetchAllAppointments={fetchAllAppointments}
        />
      )}

      {showMicrosoftModal && (
        <MicrosoftLoginModal
          isOpen={showMicrosoftModal}
          onClose={() => setShowMicrosoftModal(false)}
        />
      )}
    </div>
  );
};

export default ReactBigCalendar;
