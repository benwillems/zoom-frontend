import React, { useState } from "react";
import moment from "moment-timezone";
import useNotificationStore from "@/store/useNotificationStore";
import { MdWarning } from "react-icons/md";

const SetAvailability = ({ formData, setFormData }) => {
  const { addNotification } = useNotificationStore();

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const handleCheckboxChange = (day, index) => {
    const newFormData = { ...formData };
    newFormData.time[day][index].isEnabled =
      !newFormData.time[day][index].isEnabled;
    setFormData(newFormData);
  };

  const handleTimeChange = (day, index, field, value) => {
    const newFormData = { ...formData };
    newFormData.time[day][index][field] = value;
    setFormData(newFormData);
  };

  const handleFormChange = (field, value) => {
    const newFormData = { ...formData };
    newFormData[field] = value;
    setFormData(newFormData);
  };

  const handleAddTimeSlot = (day) => {
    const newFormData = { ...formData };
    newFormData.time[day].push({ isEnabled: true, startTime: "", endTime: "" });
    setFormData(newFormData);
  };

  const handleRemoveTimeSlot = (day, index) => {
    const newFormData = { ...formData };
    newFormData.time[day].splice(index, 1);
    setFormData(newFormData);
  };

  const timezones = moment.tz.names();

  return (
    <form className="space-y-4 mx-auto p-4 bg-white rounded-lg shadow ">
      <h2 className="text-lg font-semibold mb-2">
        Select dates and time slots that people can book
      </h2>
      <p className="text-sm text-gray-600 mb-2">
        Slots that conflict with scheduled meetings won't show as bookable on
        your calendar.
      </p>

      <div className="space-y-2">
        {days.map((day) => (
          <div key={day} className="flex flex-col space-y-1 shadow px-2 py-1">
            <div className="flex items-center justify-between">
              {/* Day Label with Checkbox */}
              <div className="flex items-center space-x-2">
                {formData.time[day].length > 0 && (
                  <input
                    type="checkbox"
                    checked={formData.time[day].every((slot) => slot.isEnabled)}
                    onChange={() => {
                      formData.time[day].forEach((slot, index) =>
                        handleCheckboxChange(day, index)
                      );
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                )}
                <h3 className="font-medium text-sm">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </h3>
              </div>

              <div className="flex items-center space-x-2 ml-auto">
                <div className="space-y-1">
                  {formData.time[day].map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 shadow p-1 rounded-md bg-gray-50"
                    >
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => {
                          handleTimeChange(
                            day,
                            index,
                            "startTime",
                            e.target.value
                          );
                          if (slot.isEnabled && !slot.endTime) {
                            addNotification({
                              iconColor: "red",
                              header: "Please select an end time",
                              icon: MdWarning,
                              hideProgressBar: false,
                              notificationDisplayTimer: 3000,
                            });
                          }
                        }}
                        disabled={!slot.isEnabled}
                        className="form-input w-20 px-1 py-1 border rounded-md text-sm"
                      />
                      <span className="text-sm">To</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => {
                          const startTime = slot.startTime;
                          const endTime = e.target.value;
                          if (endTime <= startTime) {
                            addNotification({
                              iconColor: "red",
                              header: "End time must be after start time",
                              icon: MdWarning,
                              hideProgressBar: false,
                              notificationDisplayTimer: 3000,
                            });
                          } else {
                            handleTimeChange(day, index, "endTime", endTime);
                          }
                        }}
                        disabled={!slot.isEnabled}
                        className="form-input w-20 px-1 py-1 border rounded-md text-sm"
                      />
                      {index === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleAddTimeSlot(day)}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          +
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeSlot(day, index)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block font-semibold text-sm">Timezone:</label>
        <select
          value={formData.timezone}
          onChange={(e) => handleFormChange("timezone", e.target.value)}
          className="form-select border p-1 w-full rounded text-sm"
        >
          {timezones.map((tz) => {
            const offset = moment.tz(tz).utcOffset();
            const sign = offset >= 0 ? "+" : "-";
            const hours = Math.floor(Math.abs(offset) / 60);
            const minutes = Math.abs(offset) % 60;
            const gmtOffset = `GMT${sign}${String(hours).padStart(
              2,
              "0"
            )}:${String(minutes).padStart(2, "0")}`;
            return (
              <option key={tz} value={tz}>
                {tz} - {gmtOffset}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block font-semibold text-sm">Repeats:</label>
        <select
          value={formData.repeats}
          onChange={(e) => handleFormChange("repeats", e.target.value)}
          className="form-select border p-1 w-full rounded text-sm"
        >
          <option value="forever">Forever</option>
          <option value="dateRange">Date Range</option>
        </select>
      </div>

      {formData.repeats === "dateRange" && (
        <div className="flex space-x-2">
          <div>
            <label className="block font-semibold text-sm">Start Date:</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleFormChange("startDate", e.target.value)}
              className="form-input border p-1 rounded text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-sm">End Date:</label>
            <input
              type="date"
              value={formData.endDate}
              min={formData.startDate}
              onChange={(e) => handleFormChange("endDate", e.target.value)}
              className="form-input border p-1 rounded text-sm"
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="block font-semibold text-sm">
          Buffer Time Between Schedules:
        </label>
        <div className="flex space-x-2">
          <div className="flex flex-col">
            <label className="block pl-3 text-sm">Before</label>
            <select
              value={formData.buffer.before}
              onChange={(e) =>
                handleFormChange("buffer", {
                  ...formData.buffer,
                  before: e.target.value,
                })
              }
              className="form-select border p-1 rounded text-sm"
            >
              <option value="none">None</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="block pl-3 text-sm">After</label>
            <select
              value={formData.buffer.after}
              onChange={(e) =>
                handleFormChange("buffer", {
                  ...formData.buffer,
                  after: e.target.value,
                })
              }
              className="form-select border p-1 rounded text-sm"
            >
              <option value="none">None</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SetAvailability;
