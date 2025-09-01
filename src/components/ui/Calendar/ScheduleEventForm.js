import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import ReactTextareaAutosize from "react-textarea-autosize";
import useSearchClientsStore from "@/store/useSearchClientsStore";
import { formatDateByShortDayLongMonthNumericDay } from "@/utils/dates";
import Select from "react-select";
import {
  CustomOption,
  CustomSingleValue,
  fetchWithAuth,
} from "@/utils/generalUtils";
import { useRef } from "react";
import useEscapeAndOutsideClick from "@/components/hooks/useEscapeAndOutsideClick";
import { MdPeopleAlt, MdEdit, MdEmail } from "react-icons/md";
import CreatableSelect from "react-select/creatable";
import { format } from "date-fns";

const ScheduleEventForm = ({
  onCancel,
  initialEvent,
  isOpen,
  position,
  fetchAllAppointments,
}) => {
  const { clients, fetchClients } = useSearchClientsStore();

  const [event, setEvent] = useState({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(),
  });

  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [displayDate, setDisplayDate] = useState(
    formatDateByShortDayLongMonthNumericDay(event.start)
  );
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientOptions, setClientOptions] = useState([]);
  const [inputClientName, setInputClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [endOption, setEndOption] = useState("never");
  const [endDate, setEndDate] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [monthlyOption, setMonthlyOption] = useState(null);
  const [selectedDayOfMonth, setSelectedDayOfMonth] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(null);
  const [recurrenceType, setRecurrenceType] = useState("never");
  const [endTimes, setEndTimes] = useState(1);

  const [recurrenceOptions, setRecurrenceOptions] = useState([
    { value: "never", label: "Never" },
    { value: "daily", label: `Daily at ${formatTime(event.start)}` },
    { value: "weekly", label: `Weekly on ${formatDay(event.start)}` },
    { value: "monthly", label: `Monthly on ${formatMonthDay(event.start)}` },
    { value: "custom", label: "Custom" },
  ]);

  const customRecurrenceOptions = [
    { value: "dailys", label: "Daily" },
    { value: "weeklys", label: "Weekly" },
    { value: "monthlys", label: "Monthly" },
  ];

  const daysOfWeeks = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const weeksOfMonth = [
    { value: "first", label: "First" },
    { value: "second", label: "Second" },
    { value: "third", label: "Third" },
    { value: "fourth", label: "Fourth" },
    { value: "last", label: "Last" },
  ];

  const daysOfMonth = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
  }));

  const [selectedRecurrence, setSelectedRecurrence] = useState(
    recurrenceOptions[0]
  );
  const [customRecurrence, setCustomRecurrence] = useState("");

  const handleRecurrenceChange = (selectedOption) => {
    setSelectedRecurrence(selectedOption);
    setRecurrenceType(selectedOption.value);

    if (selectedOption.value !== "custom") {
      setCustomRecurrence(null);
      setSelectedDays([]);
      setMonthlyOption(null);
      setSelectedDayOfMonth(null);
      setSelectedWeek(null);
      setSelectedDayOfWeek(null);
    }
  };

  const handleCustomRecurrenceChange = (selectedOption) => {
    setCustomRecurrence(selectedOption);
    if (selectedOption.value !== "weekly") {
      setSelectedDays([]);
    }
    if (selectedOption.value !== "monthly") {
      setMonthlyOption(null);
      setSelectedDayOfMonth(null);
      setSelectedWeek(null);
      setSelectedDayOfWeek(null);
    }
  };
  const handleMonthlyOptionChange = (event) => {
    setMonthlyOption(event.target.value);
  };

  const handleDayOfMonthChange = (selectedOption) => {
    setSelectedDayOfMonth(selectedOption);
  };

  const handleWeekChange = (selectedOption) => {
    setSelectedWeek(selectedOption);
  };

  const handleDayOfWeekChange = (selectedOption) => {
    setSelectedDayOfWeek(selectedOption);
  };

  function formatDay(dateInput) {
    const date = new Date(dateInput);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  function formatMonthDay(dateInput) {
    const date = new Date(dateInput);
    return date.getDate();
  }

  const endOptions = [
    { value: "never", label: "Never" },
    { value: "on", label: "On" },
    { value: "after", label: "After" },
  ];
  const handleEndOptionChange = (selectedOption) => {
    setEndOption(selectedOption.value);
  };

  const handleDaySelection = (day) => {
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day]
    );
  };

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  useEffect(() => {
    const updatedOptions = [
      { value: "never", label: "Never" },
      { value: "daily", label: `Daily at ${formatTime(event.start)}` },
      { value: "weekly", label: `Weekly on ${formatDay(event.start)}` },
      {
        value: "monthly",
        label: `Monthly on the ${formatMonthDay(event.start)}`,
      },
      { value: "custom", label: "Custom" },
    ];
    setRecurrenceOptions(updatedOptions);  }, [event.start]);
  
  const formRef = useRef(null);
  // Modified to use a state variable to control when outside clicks should close the form
  const [isOutsideClickEnabled, setIsOutsideClickEnabled] = useState(true);
  useEscapeAndOutsideClick(formRef, onCancel, isOutsideClickEnabled);

  useEffect(() => {
    setEvent(initialEvent);
    setDisplayDate(
      formatDateByShortDayLongMonthNumericDay(new Date(initialEvent?.start))
    );
  }, [initialEvent]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    let options = clients?.map((client) => ({
      value: client.id,
      label: client.name,
      email: client.email || "",
    }));

    if (inputClientName) {
      options = [
        ...options,
        {
          value: `${inputClientName}`,

          label: `Add new client "${inputClientName}"`,
          isNew: true,
        },
      ];
    }

    setClientOptions(options);
  }, [clients, inputClientName]);

  function formatTime(dateInput) {
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
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "start" || name === "end") {
      // Parse the time and update the respective date (start or end)
      const timeParts = value.split(":");
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const newDate = new Date(event[name]);
      newDate.setHours(hours, minutes);

      setEvent((prevEvent) => ({
        ...prevEvent,
        [name]: newDate,
      }));
    } else {
      setEvent((prevEvent) => ({
        ...prevEvent,
        [name]: value,
      }));
    }
  };

  // Separate change for endTime, if combined with handleChange the end time would default to being a day forward
  const handleEndTimeChange = (e) => {
    // Assuming the value comes in format 'HH:MM'
    const { value } = e.target;
    const timeParts = value.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    // Use the start date but change the time to the new end time
    const newEndDate = new Date(event.start);
    newEndDate.setHours(hours, minutes);

    setEvent((prevEvent) => ({
      ...prevEvent,
      end: newEndDate,
    }));
  };

  // Handles date changes when the user selected an existing or starts a new event. Function is use specifically for the calendar day selected
  const handleDateChange = (newDate) => {
    // Ensure newDate is a Date object
    newDate = new Date(newDate);

    // Carry over the existing time from event.start
    const newStartDateTime = new Date(event.start);
    newStartDateTime.setFullYear(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate()
    );

    // Carry over the existing time from event.end
    const newEndDateTime = new Date(event.end);
    newEndDateTime.setFullYear(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate()
    );

    // Update the event with the new start and end dates
    setEvent((prevEvent) => ({
      ...prevEvent,
      start: newStartDateTime,
      end: newEndDateTime,
    }));

    setDisplayDate(formatDateByShortDayLongMonthNumericDay(newStartDateTime));

    setIsCalendarVisible(false);
  };

  const handleClientChange = (newValue) => {
    setSelectedClient(newValue);
    if (newValue && newValue.isNew) {
      setClientEmail("");
      setIsEditingEmail(true);
    } else {
      setClientEmail(newValue?.email || "");
      setIsEditingEmail(!newValue?.email);
    }
  };

  const handleCreateClientOption = (inputValue) => {
    setInputClientName(inputValue);
    setSelectedClient({ label: inputValue, value: inputValue });
    setClientEmail("");
    setIsEditingEmail(true);
  };

  const handleEmailChange = (e) => {
    setClientEmail(e.target.value);
  };

  const toggleEmailEdit = () => {
    setIsEditingEmail(!isEditingEmail);
  };

  const dayIndexMap = {
    Su: "Sunday",
    Mo: "Monday",
    Tu: "Tuesday",
    We: "Wednesday",
    Th: "Thursday",
    Fr: "Friday",
    Sa: "Saturday",
  };

  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  const handleSubmitInternal = async () => {
    let jsonData = {
      title: event.title,
      description: event.description,
      startTime: event.start.toISOString(),
      endTime: event.end.toISOString(),
      timeZone: "Asia/Calcutta",
      clientEmail: clientEmail,
    };

    if (inputClientName) {
      jsonData.clientName = inputClientName;
    } else if (typeof selectedClient?.value == "number") {
      jsonData.clientId = selectedClient.value;
    }

    const recurrenceTypeMap = {
      dailys: 1,
      weeklys: 2,
      monthlys: 3,
    };
    const dayIndexMap = {
      Su: 1,
      Mo: 2,
      Tu: 3,
      We: 4,
      Th: 5,
      Fr: 6,
      Sa: 7,
    };
    if (recurrenceType === "never") {
      jsonData.recurringMeeting = false;
    } else {
      jsonData.recurringMeeting = true;
    }
    jsonData.recurringMeetingType = customRecurrence
      ? recurrenceTypeMap[customRecurrence.value]
      : null;
    jsonData.recurringInterval = repeatEvery;
    jsonData.recurringWeeklyDays = selectedDays.map((day) => dayIndexMap[day]);
    jsonData.recurringMonthlyDay =
      monthlyOption === "dayOfMonth" ? selectedDayOfMonth.value : null;
    jsonData.recurringMonthlyWeek =
      monthlyOption === "weekOfMonth"
        ? weeksOfMonth.findIndex((week) => week.value === selectedWeek.value) +
          1
        : null;
    jsonData.recurringMonthlyWeekDay =
      monthlyOption === "weekOfMonth"
        ? daysOfWeeks.findIndex(
            (day) => day.value === selectedDayOfWeek.value
          ) + 1
        : null;

    if (endOption === "on") {
      jsonData.recurringEndDate =
        new Date(endDate).toISOString().split(".")[0] + "Z";
    } else if (endOption === "after") {
      jsonData.recurringEndTimes = endTimes;
    }

    try {
      await fetchWithAuth("/api/meeting/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });
      fetchAllAppointments();
      fetchClients();
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
    onCancel();
  };

  if (!isOpen) return null;

  return (    <div      style={{
        position: "absolute",
        // top: `${position.y}px`,
        // left: `${position.x}px`,
        top: "19%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
      }}
      className="bg-white shadow-2xl drop-shadow-2xl h-auto w-[510px] px-3 pt-2 pb-2 rounded-lg"
      ref={formRef}
      onClick={(e) => {
        e.stopPropagation();
        setIsOutsideClickEnabled(false);
        setTimeout(() => setIsOutsideClickEnabled(true), 100);
      }}
    >      <form
        onSubmit={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          setIsOutsideClickEnabled(false);
          setTimeout(() => setIsOutsideClickEnabled(true), 100);
        }}
        className="flex flex-col p-2 space-y-2"
      ><input
          type="text"
          name="title"
          placeholder="Add title"
          value={event.title}
          onChange={handleChange}
          onClick={(e) => e.stopPropagation()}
          className="border-b-2 pl-0.5 text-lg border-blue-300 placeholder:text-gray-700 outline-none"
          required
          autoFocus
        />

        <div className="flex items-center space-x-2 relative">          <input
            type="text"
            placeholder="Select Day"
            className="flex-1 outline-none focus:border-b-2 w-28 focus:border-blue-300 focus:bg-gray-100 "
            value={displayDate}
            onClick={(e) => {
              e.stopPropagation();
              setIsCalendarVisible(!isCalendarVisible);
            }}
            readOnly
          />
          {isCalendarVisible && (
            <Calendar
              value={event.start}
              onChange={handleDateChange}
              className="absolute top-8 z-10"
            />
          )}

          <div className="custom-time-container">            <input
              type="time"
              name="start"
              value={formatTime(event.start)}
              onChange={handleChange}
              onClick={(e) => e.stopPropagation()}
              className="custom-time-input"
              required
            />
          </div>

          <div className="mx-2">-</div>

          <div className="custom-time-container">            <input
              type="time"
              name="end"
              value={formatTime(event.end)}
              onChange={handleEndTimeChange}
              onClick={(e) => e.stopPropagation()}
              className="custom-time-input"
              required
            />
          </div>
        </div>

        <div className="w-full">
          <CreatableSelect
            isClearable
            onChange={handleClientChange}
            onCreateOption={handleCreateClientOption}
            options={clientOptions}
            value={selectedClient}
            allowCreateWhileLoading
            createOptionPosition="first"
            placeholder={"Type client to search or add client"}
            formatCreateLabel={(inputValue) => `Add new client "${inputValue}"`}
            styles={{
              menuList: (provided) => ({
                ...provided,
                maxHeight: "200px",
                fontSize: "16px",
              }),
            }}
            formatOptionLabel={(option, { context }) => {
              if (option?.label.startsWith("Add new client")) {
                return option?.label;
              } else {
                return (
                  <div className="flex items-center space-x-2">
                    <MdPeopleAlt className="text-lg" />
                    <span>{option?.label}</span>
                  </div>
                );
              }
            }}
          />
        </div>

        {selectedClient &&
          (isEditingEmail ? (
            <div className="w-full mt-2 py-2">
              <input
                type="email"
                value={clientEmail}
                onChange={handleEmailChange}
                onBlur={toggleEmailEdit}
                placeholder="Enter client email"
                className="w-full border border-blue-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 bg-white shadow"
                autoFocus
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-between h-9 bg-gray-100 border border-gray-300 rounded px-2 py-1 mt-2 shadow-sm hover:bg-gray-200 cursor-pointer"
              onClick={toggleEmailEdit}
            >
              <p className="text-sm flex items-center ">
                <MdEmail className="mr-1 text-lg" />
                {clientEmail || "Click to add email"}
              </p>
              <MdEdit className="text-gray-500" />
            </div>
          ))}

        <ReactTextareaAutosize
          name="description"
          placeholder="Enter description (optional)"
          value={event.description}
          onChange={handleChange}
          className="flex w-full border text-sm border-slate-200 rounded-md py-2 px-2 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 placeholder:text-slate-500 resize-none"
        />

        <div className="flex flex-col mt-2 pt-2">
          <div className="flex items-center">
            <label className="text-sm font-semibold mr-2 ">Repeat:</label>
            <Select
              value={selectedRecurrence}
              onChange={handleRecurrenceChange}
              options={recurrenceOptions}
              placeholder="Select Recurrence"
              className="text-sm w-40"
            />
            {selectedRecurrence && selectedRecurrence.value === "custom" && (
              <Select
                value={customRecurrenceOptions.find(
                  (option) => option.value === customRecurrence
                )}
                onChange={handleCustomRecurrenceChange}
                options={customRecurrenceOptions}
                placeholder="Select daily,weekly monthly"
                className="text-sm ml-6"
              />
            )}
          </div>

          {customRecurrence && selectedRecurrence.value === "custom" && (
            <div className="mt-2 flex items-center">
              <label className="text-sm font-semibold">Every:</label>
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  min="1"
                  value={repeatEvery}
                  onChange={(e) => setRepeatEvery(e.target.value)}
                  className=" w-11 p-2 border border-gray-300 rounded-md ml-2 h-9"
                />
                <span className="ml-2">
                  {customRecurrence.value === "dailys"
                    ? "days"
                    : customRecurrence.value === "weeklys"
                    ? "weeks"
                    : customRecurrence.value === "monthlys"
                    ? "months"
                    : ""}
                </span>
              </div>
            </div>
          )}

          {customRecurrence && customRecurrence.value === "weeklys" && (
            <div className="mt-2 flex items-center">
              <label className="text-sm font-semibold mr-4">On:</label>
              <div className="flex flex-wrap mt-1">
                {daysOfWeek.map((day) => (
                  <div key={day} className="mr-2 mb-2 h-9">
                    <button
                      type="button"
                      onClick={() => handleDaySelection(day)}
                      className={`p-2 border rounded-md ${
                        selectedDays.includes(day)
                          ? "bg-blue-500 text-white h-10"
                          : "bg-white text-black h-10"
                      }`}
                    >
                      {day}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customRecurrence && customRecurrence.value === "monthlys" && (
            <div className="mt-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="dayOfMonth"
                  name="monthlyOption"
                  value="dayOfMonth"
                  checked={monthlyOption === "dayOfMonth"}
                  onChange={handleMonthlyOptionChange}
                />
                <label htmlFor="dayOfMonth" className="ml-2 flex items-center">
                  On the
                </label>
                <Select
                  value={selectedDayOfMonth}
                  onChange={handleDayOfMonthChange}
                  options={daysOfMonth}
                  placeholder="Select Date"
                  className="text-sm ml-2 mb-2"
                  isDisabled={monthlyOption !== "dayOfMonth"}
                />
              </div>
              <div className="mt-2 flex">
                <input
                  type="radio"
                  id="weekOfMonth"
                  name="monthlyOption"
                  value="weekOfMonth"
                  checked={monthlyOption === "weekOfMonth"}
                  onChange={handleMonthlyOptionChange}
                />
                <label htmlFor="weekOfMonth" className="ml-2 flex items-center">
                  On the
                </label>
                <Select
                  value={selectedWeek}
                  onChange={handleWeekChange}
                  options={weeksOfMonth}
                  placeholder="Select Week"
                  className="text-sm ml-2"
                  isDisabled={monthlyOption !== "weekOfMonth"}
                />
                <Select
                  value={selectedDayOfWeek}
                  onChange={handleDayOfWeekChange}
                  options={daysOfWeeks}
                  placeholder="Select Day"
                  className="text-sm ml-2"
                  isDisabled={monthlyOption !== "weekOfMonth"}
                />
              </div>
            </div>
          )}

          {customRecurrence && selectedRecurrence.value === "custom" && (
            <div className="mt-2 flex items-center">
              <label className="text-sm font-semibold">End:</label>
              <Select
                value={endOptions.find((option) => option.value === endOption)}
                onChange={handleEndOptionChange}
                options={endOptions}
                placeholder="Select End Option"
                className="text-sm mt-1 ml-2"
              />
            </div>
          )}

          {endOption === "on" && (
            <div className="mt-2 ">
              <label className="text-sm font-semibold">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          {endOption === "after" && (
            <div className="mt-2">
              <label className="text-sm font-semibold">Occurrences:</label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          {selectedRecurrence && selectedRecurrence.value !== "never" && (
            <div className="mt-4 text-sm pt-3 bg-gray-100 p-4 rounded-md shadow-sm">
              <p className="mb-2">
                Your event starts on{" "}
                <strong>{format(event.start, "MMMM do, yyyy")}</strong> at{" "}
                <strong>{format(event.start, "h:mm aa")}</strong>.
              </p>
              {endOption === "on" && (
                <p className="mb-2">
                  It ends on{" "}
                  {/* <strong>{new Date(endDate).toLocaleDateString()}</strong>. */}
                  <strong>
                    {isNaN(new Date(endDate))
                      ? "Invalid date"
                      : format(new Date(endDate), "MMMM do, yyyy")}
                  </strong>
                  .
                </p>
              )}
              {endOption === "after" && (
                <p className="mb-2">
                  It ends after <strong>{endTimes}</strong> occurrences.
                </p>
              )}

              {customRecurrence && (
                <div className="mt-2">
                  <p className="mb-2">
                    It repeats every{" "}
                    <strong>
                      {repeatEvery}{" "}
                      {customRecurrence.value === "dailys"
                        ? "day"
                        : customRecurrence.value === "weeklys"
                        ? "week"
                        : "month"}
                    </strong>
                    .
                  </p>
                  {customRecurrence.value === "weeklys" &&
                    selectedDays.length > 0 && (
                      <p className="mb-2">
                        On{" "}
                        <strong>
                          {selectedDays
                            .map((day) => dayIndexMap[day])
                            .join(", ")}
                        </strong>
                        .
                      </p>
                    )}
                  {customRecurrence.value === "monthlys" && (
                    <p className="mb-2">
                      On the
                      {monthlyOption === "dayOfMonth" && selectedDayOfMonth && (
                        <strong>
                          {" "}
                          {selectedDayOfMonth.value}
                          {getOrdinalSuffix(selectedDayOfMonth.value)} day{" "}
                        </strong>
                      )}
                      {monthlyOption === "weekOfMonth" &&
                        selectedWeek &&
                        selectedDayOfWeek && (
                          <strong>
                            {" "}
                            week {selectedWeek.value} on{" "}
                            {selectedDayOfWeek.value}
                          </strong>
                        )}
                      .
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end items-center space-x-2 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-md text-sm px-3 py-1.5 text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitInternal}
            className="text-gray-800 bg-blue-300 border hover:bg-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-md text-sm px-3 py-1.5 text-center disabled:cursor-not-allowed disabled:bg-gray-300"
            disabled={!event.title || (!selectedClient && !inputClientName)}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleEventForm;
