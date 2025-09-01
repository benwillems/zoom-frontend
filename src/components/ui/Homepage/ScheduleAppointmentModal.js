import React, { useEffect, useState } from "react";
import useClientStore from "@/store/clientStore";
import useAudioStore from "@/store/useAudioStore";
import ReactTextareaAutosize from "react-textarea-autosize";
import "react-calendar/dist/Calendar.css";
import { formatDateByShortDayLongMonthNumericDay } from "@/utils/dates";
import ClientForm from "./ClientForm";
import useSearchClientsStore from "@/store/useSearchClientsStore";

const ScheduleAppointmentModal = ({
  onClose,
  selectedClient,
  setSelectedClient,
}) => {
  const { fetchClients } = useSearchClientsStore();
  const { fetchAllAppointments, setAppointmentNote, events } = useClientStore();
  const { calendarDate, activeAppointment, setActiveAppointment } =
    useAudioStore();
  const [isChecked, setIsChecked] = useState(false);
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [isDuplicateClient, setIsDuplicateClient] = useState(false);
  const [isClientScheduled, setIsClientScheduled] = useState(false);
  const [isClientRecorded, setIsClientRecorded] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  useEffect(() => {
    if (activeAppointment) {
      setScheduleTitle(activeAppointment.title || "");
      setScheduleStartTime(
        formatTime(new Date(activeAppointment.scheduleStartAt))
      );
      setScheduleEndTime(formatTime(new Date(activeAppointment.scheduleEndAt)));
      setScheduleDescription(activeAppointment.description || "");
      setSelectedDate(new Date(activeAppointment.scheduleStartAt));
      setDisplayDate(
        formatDateByShortDayLongMonthNumericDay(
          new Date(activeAppointment.scheduleStartAt)
        )
      );

      if (activeAppointment?.client) {
        setSelectedClient({
          value: activeAppointment.client.id,
          label: activeAppointment.client.name,
        });
        setClientEmail(activeAppointment.client.email || "");
      }
    }
  }, [activeAppointment]);

  const formatTime = (dateInput) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      console.error(
        "formatTime: provided value is not a valid date",
        dateInput
      );
      return "";
    }
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const defaultEndTime = new Date(Date.now() + 30 * 60000);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleStartTime, setScheduleStartTime] = useState(
    formatTime(new Date())
  );
  const [scheduleEndTime, setScheduleEndTime] = useState(
    formatTime(defaultEndTime)
  );
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(calendarDate);
  const [displayDate, setDisplayDate] = useState(
    formatDateByShortDayLongMonthNumericDay(new Date(selectedDate))
  );
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  // Handles date changes when the user selected an existing or starts a new event. Function is use specifically for the calendar day selected
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setDisplayDate(formatDateByShortDayLongMonthNumericDay(new Date(newDate)));
    setIsCalendarVisible(false);
  };

  const handleScheduleAppointment = () => {
    const startDate = new Date(selectedDate);
    const timeParts = scheduleStartTime.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    startDate.setHours(hours, minutes);

    const endDate = new Date(selectedDate);
    const endTimeParts = scheduleEndTime.split(":");
    const endHours = parseInt(endTimeParts[0], 10);
    const endMinutes = parseInt(endTimeParts[1], 10);
    endDate.setHours(endHours, endMinutes);

    // let formData = new FormData()
    // formData.append('scheduleStartAt', startDate)
    // formData.append('scheduleEndAt', endDate)
    // formData.append('title', scheduleTitle)
    // formData.append('description', scheduleDescription)
    // formData.append('isMultiMembers', isChecked)

    let payload = {
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      title: scheduleTitle,
      description: scheduleDescription,
      isMultiMembers: isChecked,
      clientId: null,
      clientName: null,
      clientEmail: clientEmail,
      timeZone: timezone,
    };

    if (selectedClient) {
      if (typeof selectedClient?.value === "number") {
        payload.clientId = selectedClient?.value;
      } else if (typeof selectedClient?.value === "string") {
        payload.clientName = selectedClient?.value;
      }
    }

    // fetch('/api/appointment/schedule', {
    fetch("/api/meeting/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        fetchAllAppointments();
        setAppointmentNote(null);
        setActiveAppointment(data?.appointment);
        fetchClients();
        onClose();
      })
      .catch((error) =>
        console.error("Error creating new appointment:", error)
      );

    onClose();
  };

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setScheduleStartTime(newStartTime);
    const [hours, minutes] = newStartTime.split(":").map(Number);
    const newEndTime = new Date(selectedDate);
    newEndTime.setHours(hours, minutes + 30);
    setScheduleEndTime(formatTime(newEndTime));
  };

  useEffect(() => {
    const isDuplicate = events.some(
      (event) =>
        event.client?.id === selectedClient?.value &&
        (event.status === "SCHEDULED" || event.status === "RECORDING")
    );
    setIsDuplicateClient(isDuplicate);
    const clientEvent = events.find(
      (event) => event.client?.id === selectedClient?.value
    );

    if (clientEvent) {
      setIsClientRecorded(clientEvent.status === "RECORDING");
      setIsClientScheduled(clientEvent.status === "SCHEDULED");
    } else {
      setIsClientScheduled(false);
      setIsClientRecorded(false);
    }
  }, [selectedClient, events]);

  const message = isClientRecorded
    ? "Choose another client or add a new one."
    : isClientScheduled
    ? "Choose another client or add a new one."
    : null;

  return (
    <div className="hidden fixed inset-0 sm:flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-md p-6 z-50 w-full max-w-xl">
        <div className="flex flex-col mb-14">
          <h2 className="text-xl font-semibold">Schedule Appointment</h2>
          <input
            type="text"
            placeholder="Select Day"
            className="w-36 outline-none bg-white"
            value={displayDate}
            onClick={() => setIsCalendarVisible(!isCalendarVisible)}
            readOnly
          />
        </div>
        <div className="space-y-4">
          <ClientForm
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            isChecked={isChecked}
            setIsChecked={setIsChecked}
            message={message}
            clientEmail={clientEmail}
            setClientEmail={setClientEmail}
            isEditingEmail={isEditingEmail}
            setIsEditingEmail={setIsEditingEmail}
          />
          <div className="flex flex-col mx-1 relative">
            <div className="flex items-center justify-start space-x-2 mr-3 pr-">
              <input
                type="checkbox"
                id="multipleClients"
                name="multipleClients"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
              <label htmlFor="multipleClients" className="text-base pr-6">
                Multiple Clients
              </label>

              <div className="flex items-center space-x-2 ml-6">
                <div className="custom-time-container">
                  <input
                    type="time"
                    value={scheduleStartTime}
                    onChange={handleStartTimeChange}
                    className="custom-time-input"
                    required
                  />
                </div>
                <div>to</div>
                <div className="custom-time-container">
                  <input
                    type="time"
                    value={scheduleEndTime}
                    onChange={(e) => setScheduleEndTime(e.target.value)}
                    className="custom-time-input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <input
            type='text'
            name='title'
            placeholder='Add title (optional)'
            value={scheduleTitle}
            onChange={e => setScheduleTitle(e.target.value)}
            className='w-full border-b-2 pl-0.5 text-base border-blue-300 placeholder:text-gray-700 outline-none'
          /> */}
          <ReactTextareaAutosize
            name="description"
            placeholder="Enter description (optional)"
            value={scheduleDescription}
            onChange={(e) => setScheduleDescription(e.target.value)}
            minRows={2}
            className="w-full border bg-white border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="flex justify-end mt-6 space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleScheduleAppointment}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isClientScheduled || isClientRecorded
                ? "bg-gray-400 cursor-not-allowed text-gray-700"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={!selectedClient || isDuplicateClient}
          >
            {isClientRecorded
              ? "Already Recording"
              : isClientScheduled
              ? "Already Scheduled"
              : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointmentModal;
