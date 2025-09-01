import { useEffect, useState } from "react";
import SetAvailability from "./SetAvailability";
import Head from "next/head";
import { FiSettings, FiShare2, FiCopy, FiX } from "react-icons/fi";
import { useRouter } from "next/router";

export default function MainComponent() {
  const router = useRouter();
  const [view, setView] = useState("home");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState([]);

  const handleSubmit = async () => {
    for (const day in formData.time) {
      for (const slot of formData.time[day]) {
        if (slot.isEnabled && (!slot.startTime || !slot.endTime)) {
          alert(
            `Please fill both start and end times for ${
              day.charAt(0).toUpperCase() + day.slice(1)
            }`
          );
          return;
        }
      }
    }

    const dataToSend = {
      scheduleId: formData.scheduleId,
      name: formData.name,
      timezone: formData.timezone,
      schedule: Object.fromEntries(
        Object.entries(formData.time).map(([day, slots]) => [
          day,
          slots
            .filter((slot) => slot.isEnabled)
            .map(({ startTime, endTime }) => ({
              start: startTime,
              end: endTime,
            })),
        ])
      ),
      startDate: formData.startDate,
      endDate: formData.endDate,
      buffer: formData.buffer,
      color: formData.color,
      description: formData.description,
      duration: formData.duration,
    };

    let sumbitMethord = "POST";
    if (formData.scheduleId) {
      sumbitMethord = "PATCH";
    }

    try {
      setLoading(true);
      const response = await fetch("api/schedule", {
        method: sumbitMethord,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        console.log("Data sent successfully");
        setView("home");
        // window.location.reload();
        fetchSchedules();
      } else {
        console.error("Failed to send data");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const [schedules, setSchedules] = useState([]);
  const [scheduleRaw, setScheduleRaw] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showUrl, setShowUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [scheduleMainUrl, setScheduleMainUrl] = useState("");
  const [showMainUrl, setShowMainUrl] = useState(false);


  // useEffect(() => {
  const fetchSchedules = () => {
    setLoading(true);
    fetch("/api/schedule")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items && Array.isArray(data.items)) {
          setScheduleMainUrl(data.schedule_url_main);
          const formattedSchedules = data.items.map((item) => ({
            schedule_id: item.schedule_id,
            availability_id: item.availability_rules?.[0]?.availability_id,
            summary: item.summary,
            duration: item.duration,
            scheduling_url: item.scheduling_url,
            active: item.active,
          }));
          setSchedules(formattedSchedules);
          setScheduleRaw(data.items);
          setFilteredSchedules(formattedSchedules);
        } else {
          console.error("Invalid data format:", data);
          setSchedules([]);
          setFilteredSchedules([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setSchedules([]);
        setFilteredSchedules([]);
      })
      .finally(() => {
        setLoading(false); // Set loading to false after data is fetched
      });
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSettingsClick = (schedule_id) => {
    setShowDropdown(showDropdown === schedule_id ? null : schedule_id);
  };

  const handleShareClick = (schedule_id) => {
    setShowUrl(showUrl === schedule_id ? null : schedule_id);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Link copied to clipboard");
    });
  };

  const handleBackClick = () => {
    router.push("/schedule");
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredSchedules(schedules);
      return;
    }

    const filtered = schedules.filter(
      (schedule) =>
        (schedule.summary &&
          schedule.summary.toLowerCase().includes(query.toLowerCase())) ||
        schedule.duration.toString().includes(query)
    );
    setFilteredSchedules(filtered);
  };

  // Add this state at the top with other states
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Update handleEdit function

  const handleDelete = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;

    try {
      setLoading(true);
      const response = await fetch("/api/schedule", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scheduleId }), // Send ID in request body
      });

      if (response.ok) {
        console.log("Schedule deleted successfully");
        fetchSchedules(); // Refresh the list
        setShowDropdown(null);
      } else {
        const errorData = await response.json();
        console.error("Failed to delete schedule:", errorData);
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (scheduleId, isActive) => {
    try {
      setLoading(true);
      const newStatus = !isActive; // Toggle the status

      const response = await fetch("/api/schedule/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduleId,
          status: newStatus, // Send new status (true/false)
        }),
      });

      if (response.ok) {
        console.log(
          `Schedule ${newStatus ? "activated" : "deactivated"} successfully`
        );
        fetchSchedules(); // Refresh schedules list
        setShowDropdown(null); // Close dropdown
      } else {
        const errorData = await response.json();
        console.error("Failed to update status:", errorData);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const defaultFormData = {
    name: "",
    timezone: "Asia/Shanghai",
    time: {
      monday: [{ isEnabled: true, startTime: "09:00", endTime: "12:00" }],
      tuesday: [{ isEnabled: true, startTime: "12:00", endTime: "17:00" }],
      wednesday: [{ isEnabled: true, startTime: "09:00", endTime: "12:00" }],
      thursday: [{ isEnabled: true, startTime: "12:00", endTime: "17:00" }],
      friday: [{ isEnabled: false, startTime: "", endTime: "" }],
      saturday: [{ isEnabled: false, startTime: "", endTime: "" }],
      sunday: [{ isEnabled: false, startTime: "", endTime: "" }],
    },
    repeats: "forever",
    startDate: "",
    endDate: "",
    buffer: { before: "none", after: "none" },
    color: "",
    description: "",
    duration: "30",
  };

  const handleEdit = async (scheduleId) => {
    try {
      console.log("Editing schedule:", scheduleId);
      setLoading(true);
      console.log("Schedule to edit:", scheduleRaw);
      const scheduleToEdit = scheduleRaw.find(
        (s) => s.schedule_id === scheduleId
      );
      if (!scheduleToEdit) {
        console.error("Schedule not found");
        return;
      }

      // Set editing schedule
      setEditingSchedule(scheduleToEdit);

      const defaultTimeSlots = {
        monday: [{ isEnabled: false, startTime: "", endTime: "" }],
        tuesday: [{ isEnabled: false, startTime: "", endTime: "" }],
        wednesday: [{ isEnabled: false, startTime: "", endTime: "" }],
        thursday: [{ isEnabled: false, startTime: "", endTime: "" }],
        friday: [{ isEnabled: false, startTime: "", endTime: "" }],
        saturday: [{ isEnabled: false, startTime: "", endTime: "" }],
        sunday: [{ isEnabled: false, startTime: "", endTime: "" }],
      };

      let timeSlots = { ...defaultTimeSlots };

      console.log("Schedule to edit:", scheduleToEdit);

      if (scheduleToEdit.availability_rules?.[0]?.segments_recurrence) {
        const recurrence =
          scheduleToEdit.availability_rules[0].segments_recurrence;
        console.log("Found recurrence rules:", recurrence);

        const dayMap = {
          mon: "monday",
          tue: "tuesday",
          wed: "wednesday",
          thu: "thursday",
          fri: "friday",
          sat: "saturday",
          sun: "sunday",
        };

        Object.entries(recurrence).forEach(([shortDay, segments]) => {
          const day = dayMap[shortDay];
          console.log(`Processing ${shortDay} -> ${day} with`, segments);

          if (day && Array.isArray(segments)) {
            timeSlots[day] = segments.map((segment) => ({
              isEnabled: true,
              startTime: segment.start,
              endTime: segment.end,
            }));
            console.log(`Mapped ${day} slots:`, timeSlots[day]);
          }
        });
      } else {
        console.warn("No recurrence rules found");
      }

      const bufferConverter = (value) =>
        value === 0 ? "none" : value.toString();

      const newFormData = {
        scheduleId: scheduleId,
        name: scheduleToEdit.summary || "",
        timezone: scheduleToEdit.time_zone || "America/Los_Angeles",
        time: timeSlots,
        description: scheduleToEdit.description || "",
        duration: scheduleToEdit.duration?.toString() || "30",
        buffer: scheduleToEdit.buffer
          ? {
              before: bufferConverter(scheduleToEdit.buffer.before),
              after: bufferConverter(scheduleToEdit.buffer.after),
            }
          : { before: "none", after: "none" },
        repeats: "dateRange",
        startDate: scheduleToEdit.start_date || "",
        endDate: scheduleToEdit.end_date || "",
        color: scheduleToEdit.color || "",
      };

      console.log("New form data:", newFormData);

      setFormData(newFormData);
      setView("availabilityForm");
      setStep(1);
      setShowDropdown(null);
    } catch (error) {
      console.error("Error in handleEdit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  ">
      {view === "home" ? (
        <div className="flex h-screen">
          {/* Main Content */}
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto bg">
              {/* Sticky Header */}
              <div className=" backdrop-blur-sm  top-0 z-10 mb-6 pb-4">
                <div className="flex justify-between items-center">
                <div className="flex flex-col gap-4"> {/* Changed from items-col to flex-col */}
                    <div className="flex flex-col gap-4"> {/* Added flex-col container */}
                      <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                          Booking Pages
                        </h1>
                        <div className="flex items-center justify-center px-2 py-2 
                          bg-white rounded-lg shadow-md hover:shadow-lg
                          border-2 border-blue-200
                          transform hover:scale-105 transition-all duration-200">
                          <span className="text-2xl font-bold text-blue-600">
                            {filteredSchedules.length}
                          </span>
                          <span className="ml-2 text-sm text-blue-500">
                            {filteredSchedules.length === 1 ? "" : ""}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowMainUrl(true)}
                        className="flex items-center text-blue-600 hover:text-blue-700 w-fit"
                      >
                        <FiShare2 className="w-5 h-5 mr-2" />
                        Complete Active Booking Page link
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search schedules..."
                      className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <svg
                      className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Loader */}
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                  <div className="flex space-x-2 mb-4">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-[bounce_1s_ease-in-out_infinite]"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite]"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-[bounce_1s_ease-in-out_0.4s_infinite]"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
                    <span className="text-lg font-medium text-gray-700 animate-pulse">
                      Loading Schedules...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(schedules) &&
                    filteredSchedules.map((schedule) => (
                      <div
                        key={schedule.schedule_id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 
                          hover:shadow-lg transition-all duration-200 group"
                      >
                        <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h2
                              className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 
                              transition-colors duration-200"
                            >
                              {schedule.summary}
                            </h2>

                            <div className="relative">
                              <button
                                onClick={() =>
                                  handleSettingsClick(schedule.schedule_id)
                                }
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                              >
                                <FiSettings className="w-5 h-5 text-gray-600" />
                              </button>
                              {showDropdown === schedule.schedule_id && (
                                <div
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl 
    border border-gray-200 py-1 z-20"
                                >
                                  <button
                                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                                    onClick={() =>
                                      handleEdit(schedule.schedule_id)
                                    }
                                    disabled={loading}
                                  >
                                    {loading ? "Loading..." : "Edit"}
                                  </button>
                                  <button
                                    className={`w-full px-4 py-2 text-left 
        ${
          schedule.active
            ? "text-red-500 hover:bg-red-50"
            : "text-green-500 hover:bg-green-50"
        }`}
                                    onClick={() =>
                                      handleUpdate(
                                        schedule.schedule_id,
                                        schedule.active
                                      )
                                    }
                                    disabled={loading}
                                  >
                                    {loading
                                      ? "Updating..."
                                      : schedule.active
                                      ? "Deactivate"
                                      : "Activate"}
                                  </button>
                                  <button
                                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      handleDelete(schedule.schedule_id)
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-6 text-gray-600">
                            <div className="flex items-center">
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>{schedule.duration} mins</span>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-block w-2.5 h-2.5 rounded-full ${
                                  schedule.active
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></span>
                              <span className="text-sm text-gray-600">
                                {schedule.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleShareClick(schedule.schedule_id)
                            }
                            className="flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <FiShare2 className="w-5 h-5 mr-2" />
                            Share
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Fixed Action Button */}
            <div className="fixed bottom-8 right-8 flex space-x-4">
              <button
                onClick={handleBackClick}
                className="px-6 py-3 bg-blue-300 text-black rounded-lg
    hover:bg-blue-500 shadow-lg hover:shadow-xl font-semibold transition-all duration-200
    flex items-center space-x-2"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Back to Calendar</span>
              </button>

              <button
                onClick={() => {
                  setFormData(defaultFormData);
                  setView("availabilityForm");
                }}
                className="px-6 py-3 bg-blue-300 text-black rounded-lg font-semibold
      hover:bg-blue-500 shadow-lg hover:shadow-xl transition-all duration-200
      flex items-center space-x-2"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Create Schedule</span>
              </button>
            </div>
          </main>

          {/* Share Modal */}
          {showUrl && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center 
              justify-center z-50"
            >
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <button
                  onClick={() => setShowUrl(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FiX className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Share Schedule
                </h2>
                <div className="space-y-4">
                  <a
                    href={
                      schedules.find((s) => s.schedule_id === showUrl)
                        ?.scheduling_url
                    }
                    className="block text-blue-600 hover:text-blue-700 truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {
                      schedules.find((s) => s.schedule_id === showUrl)
                        ?.scheduling_url
                    }
                  </a>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        schedules.find((s) => s.schedule_id === showUrl)
                          ?.scheduling_url
                      )
                    }
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white
                      rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FiCopy className="w-5 h-5 mr-2" />
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          )}
          {showMainUrl && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <button
                  onClick={() => setShowMainUrl(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FiX className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Share Complete Active Booking Page    </h2>
                <div className="space-y-4">
                  <a
                    href={scheduleMainUrl}
                    className="block text-blue-600 hover:text-blue-700 truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {scheduleMainUrl}
                  </a>
                  <button
                    onClick={() => copyToClipboard(scheduleMainUrl)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FiCopy className="w-5 h-5 mr-2" />
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="min-h-screen flex">
            {/* Left Sidebar */}
            <div
              className="w-full lg:w-1/4 bg-gradient-to-br from-white to-blue-50/30 fixed lg:relative h-full lg:h-auto 
  shadow-xl border-r border-blue-100 overflow-y-auto backdrop-blur-sm"
            >
              <div className="p-8">
                <div className="mb-8">
                  <h2
                    className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 
        bg-clip-text text-transparent animate-gradient-x"
                  >
                    Create Schedule
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 animate-fade-in">
                    Complete all required information
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="space-y-6 relative">
                  {/* Animated Progress Line */}
                  <div className="absolute left-4 inset-y-0 w-0.5 bg-gray-100">
                    <div
                      className={`absolute top-0 w-full bg-blue-500 transition-all duration-500 ease-out
          ${step === 1 ? "h-0" : "h-full"}`}
                    />
                  </div>

                  <div className="space-y-8">
                    <button
                      onClick={() => setStep(1)}
                      className={`relative flex items-center w-full group pl-4 py-3 rounded-xl
            transform transition-all duration-300 hover:translate-x-1
            ${
              step === 1
                ? "bg-gradient-to-r from-blue-50 to-transparent shadow-sm"
                : "hover:bg-blue-50/50"
            }`}
                    >
                      <span
                        className={`
            flex items-center justify-center w-10 h-10 rounded-full 
            transform transition-all duration-300 group-hover:scale-110
            ${
              step === 1
                ? "bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse"
                : "bg-white border-2 border-gray-200 group-hover:border-blue-400 group-hover:shadow-lg"
            }`}
                      >
                        1
                      </span>
                      <div className="ml-4">
                        <span
                          className={`font-semibold block transition-colors duration-300
              ${
                step === 1
                  ? "text-blue-600"
                  : "text-gray-700 group-hover:text-blue-600"
              }`}
                        >
                          Schedule Details
                        </span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                          Basic information
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => setStep(2)}
                      className={`relative flex items-center w-full group pl-4 py-3 rounded-xl
            transform transition-all duration-300 hover:translate-x-1
            ${
              step === 2
                ? "bg-gradient-to-r from-blue-50 to-transparent shadow-sm"
                : "hover:bg-blue-50/50"
            }`}
                    >
                      <span
                        className={`
            flex items-center justify-center w-10 h-10 rounded-full 
            transform transition-all duration-300 group-hover:scale-110
            ${
              step === 2
                ? "bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse"
                : "bg-white border-2 border-gray-200 group-hover:border-blue-400 group-hover:shadow-lg"
            }`}
                      >
                        2
                      </span>
                      <div className="ml-4">
                        <span
                          className={`font-semibold block transition-colors duration-300
              ${
                step === 2
                  ? "text-blue-600"
                  : "text-gray-700 group-hover:text-blue-600"
              }`}
                        >
                          Availability
                        </span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                          Set your schedule
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 min-h-screen ">
              <div className=" mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {step === 1 ? "Schedule Details" : "Set Availability"}
                      </h1>
                      <p className="mt-1 text-gray-600">
                        {step === 1
                          ? "Enter the basic information for your schedule"
                          : "Configure your weekly availability preferences"}
                      </p>
                    </div>

                    {/* Form Content */}
                    <div className="space-y-6">
                      {step === 1 ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Schedule Name
                            </label>
                            <input
                              type="text"
                              placeholder="Enter schedule name"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-200"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Schedule Color
                            </label>
                            <div className="flex flex-wrap gap-3">
                              {[
                                "#FF0000",
                                "#800080",
                                "#0000FF",
                                "#008000",
                                "#FFFF00",
                                "#FFA500",
                                "#008080",
                                "#FFC0CB",
                                "#A52A2A",
                              ].map((color) => (
                                <button
                                  key={color}
                                  className={`
                            rounded-full transition-all duration-200
                            hover:scale-110 focus:outline-none
                            ${
                              formData.color === color
                                ? "ring-4 ring-offset-2 ring-blue-500 transform scale-110"
                                : "hover:ring-2 hover:ring-offset-2 hover:ring-gray-300"
                            }
                          `}
                                  style={{
                                    backgroundColor: color,
                                    width: "2.5rem",
                                    height: "2.5rem",
                                  }}
                                  onClick={() =>
                                    setFormData({ ...formData, color })
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Duration
                            </label>
                            <div className="flex items-center gap-3">
                              <div className="w-32">
                                <input
                                  type="number"
                                  min="15"
                                  max="240"
                                  step="15"
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={formData.duration}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      duration: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <span className="text-gray-600">Minutes</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Additional Information
                            </label>
                            <textarea
                              placeholder="Add any additional details about this schedule..."
                              className="w-full px-3 py-2 rounded-lg border border-gray-300
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      resize-none min-h-[100px]"
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <SetAvailability
                          formData={formData}
                          setFormData={setFormData}
                        />
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() =>
                          step === 1 ? setView("home") : setStep(step - 1)
                        }
                        className="px-5 py-2 border border-gray-300 rounded-lg
                text-gray-700 hover:bg-gray-50 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {step === 1 ? "Cancel" : "Back"}
                      </button>
                      <button
                        onClick={() =>
                          step === 2 ? handleSubmit() : setStep(step + 1)
                        }
                        disabled={loading}
                        className={`px-5 py-2 ${
                          loading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-400 hover:bg-blue-500"
                        } text-gray-900 font-semibold rounded-lg transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {loading
                          ? "Creating..."
                          : step === 2
                          ? "Create Schedule"
                          : "Continue"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
