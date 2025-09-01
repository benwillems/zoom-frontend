import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/generalUtils";
import useNotificationStore from "@/store/useNotificationStore";
import {
  FaRegClock,
  FaSync,
  FaInfoCircle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaTrash,
  FaBell,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import {
  MdWarning,
  MdSchedule,
  MdInfo,
  MdCheckCircle,
  MdCancel,
  MdNotifications,
  MdSms,
  MdAccessTime,
  MdPerson,
  MdPhone,
  MdEmail,
  MdDateRange,
} from "react-icons/md";
import { BiFilter, BiSearch } from "react-icons/bi";
import {
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlinePhone,
} from "react-icons/hi";
import CircleSpinner from "@/components/common/CircleSpinner";

export default function AppointmentReminderComponent() {
  const [appointmentReminders, setAppointmentReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedCards, setExpandedCards] = useState(new Set());
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    fetchAppointmentReminders();
  }, []);

  useEffect(() => {
    filterReminders();
  }, [appointmentReminders, searchTerm, statusFilter]);

  const fetchAppointmentReminders = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth("/api/appointmentReminder/get");
      if (!response.ok) throw new Error("API not available");
      const data = await response.json();
      setAppointmentReminders(data);
      if (data.length > 0) {
        addNotification({
          iconColor: "green",
          header: `Loaded ${data.length} appointment reminders`,
          icon: FaInfoCircle,
          hideProgressBar: false,
        });
      }
    } catch (error) {
      console.error("Error fetching appointment reminders:", error);
      // addNotification({
      //   iconColor: "red",
      //   header: "Failed to load appointment reminders",
      //   description: "Please check your connection and try again",
      //   icon: MdWarning,
      //   hideProgressBar: false,
      // });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterReminders = () => {
    let filtered = appointmentReminders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (reminder) =>
          reminder.client?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          reminder.id.toString().includes(searchTerm) ||
          reminder.clientId.toString().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (reminder) => reminder.status === statusFilter
      );
    }

    setFilteredReminders(filtered);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAppointmentReminders();
  };

  const deleteAppointmentReminder = async (reminderId) => {
    if (
      !confirm("Are you sure you want to delete this appointment reminder?")
    ) {
      return;
    }

    try {
      setProcessingIds((prev) => new Set([...prev, reminderId]));

      const response = await fetchWithAuth("/api/appointmentReminder/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reminderId: reminderId,
        }),
      });

      if (response.ok) {
        setAppointmentReminders((prev) =>
          prev.filter((reminder) => reminder.id !== reminderId)
        );

        addNotification({
          iconColor: "green",
          header: "Reminder deleted successfully",
          icon: FaInfoCircle,
          hideProgressBar: false,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete reminder");
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
      addNotification({
        iconColor: "red",
        header: "Failed to delete reminder",
        description: error.message || "Please try again later",
        icon: MdWarning,
        hideProgressBar: false,
      });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reminderId);
        return newSet;
      });
    }
  };

  const toggleReminderStatus = async (reminderId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setProcessingIds((prev) => new Set([...prev, reminderId]));

      const response = await fetchWithAuth("/api/appointmentReminder/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reminderId: reminderId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        setAppointmentReminders((prev) =>
          prev.map((reminder) =>
            reminder.id === reminderId
              ? { ...reminder, status: newStatus }
              : reminder
          )
        );

        addNotification({
          iconColor: "green",
          header: `Reminder ${newStatus.toLowerCase()} successfully`,
          icon: FaInfoCircle,
          hideProgressBar: false,
        });
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update reminder status"
        );
      }
    } catch (error) {
      console.error("Error updating reminder status:", error);
      addNotification({
        iconColor: "red",
        header: "Failed to update reminder status",
        description: error.message || "Please try again later",
        icon: MdWarning,
        hideProgressBar: false,
      });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reminderId);
        return newSet;
      });
    }
  };

  const toggleCardExpansion = (reminderId) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reminderId)) {
        newSet.delete(reminderId);
      } else {
        newSet.add(reminderId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified";

    try {
      return new Date(dateString).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "Active";
      case "INACTIVE":
        return "Inactive";
      case "SENT":
        return "Sent";
      case "PENDING":
        return "Pending";
      case "CANCELLED":
        return "Cancelled";
      case "FAILED":
        return "Failed";
      default:
        return status || "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "SENT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return <MdCheckCircle className="w-3 h-3" />;
      case "INACTIVE":
        return <MdCancel className="w-3 h-3" />;
      case "SENT":
        return <MdInfo className="w-3 h-3" />;
      case "PENDING":
        return <MdSchedule className="w-3 h-3" />;
      case "CANCELLED":
      case "FAILED":
        return <MdCancel className="w-3 h-3" />;
      default:
        return <MdInfo className="w-3 h-3" />;
    }
  };

  const getDaysRemaining = (dateString) => {
    if (!dateString)
      return { text: "Not specified", color: "border-gray-300 text-gray-500" };
    const now = new Date();
    const target = new Date(dateString);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) {
      return {
        text: `Passed (${Math.abs(diff)} day${
          Math.abs(diff) !== 1 ? "s" : ""
        } ago)`,
        color: "border-red-400 text-red-600",
      };
    }
    return {
      text: `${diff} day${diff !== 1 ? "s" : ""} remaining`,
      color: "border-green-400 text-green-600",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <CircleSpinner loading={loading} />
          <p className="mt-4 text-gray-600 font-medium">
            Loading appointment reminders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-indigo-70 flex flex-col">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section - now sticky */}


        {/* <div
          className="mb-8 sticky top-0 z-10 bg-white pt-4 pb-4"
          style={{ borderRadius: "1rem 1rem 0 0" }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <HiOutlineBell className="text-white text-2xl" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Appointment Reminders
                </h1>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
            >
              <FaSync
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div> */}

        {/* Reminders List - scrollable */}
        <div
          className="space-y-4"
          style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}
        >
          {filteredReminders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <MdSchedule className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== "ALL"
                  ? "No matching reminders found"
                  : "No appointment reminders found"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "Your appointment reminders will appear here once they are available."}
              </p>
              <button
                onClick={handleRefresh}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Refresh to check for new reminders
              </button>
            </div>
          ) : (
            filteredReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <MdSchedule className="w-6 h-6 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Reminder #{reminder.id}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 ${getStatusColor(
                              reminder.status
                            )}`}
                          >
                            {getStatusIcon(reminder.status)}
                            <span>{getStatusDisplay(reminder.status)}</span>
                          </span>
                        </div>

                        {/* Client Information */}
                        {reminder.client && (
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <MdPerson className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">
                                {reminder.client.name}
                              </span>
                            </div>
                            {reminder.client.phone && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <MdPhone className="w-3 h-3" />
                                <span>{reminder.client.phone}</span>
                              </div>
                            )}
                            {reminder.client.email && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <MdEmail className="w-3 h-3" />
                                <span>{reminder.client.email}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Quick Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <MdSms className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">
                              SMS: {formatDateTime(reminder.smsDateTime)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MdDateRange className="w-5 h-5 text-purple-500" />
                            <span className="text-sm text-gray-700 font-semibold">
                              Appointment:
                            </span>
                            <span className="text-sm text-gray-900 font-bold">
                              {formatDate(reminder.tentativeAppointmentDate)}
                            </span>
                            {(() => {
                              const { text, color } = getDaysRemaining(
                                reminder.tentativeAppointmentDate
                              );
                              return (
                                <span
                                  className={`flex items-center space-x-1 border-2 rounded-full px-3 py-1 ml-2 font-semibold text-xs shadow-sm ${color}`}
                                  style={{
                                    backgroundColor: color.includes("green")
                                      ? "#e6fffa"
                                      : color.includes("red")
                                      ? "#ffeaea"
                                      : "#f3f4f6",
                                    borderColor: color.includes("green")
                                      ? "#38a169"
                                      : color.includes("red")
                                      ? "#e53e3e"
                                      : "#a0aec0",
                                    color: color.includes("green")
                                      ? "#276749"
                                      : color.includes("red")
                                      ? "#c53030"
                                      : "#4a5568",
                                  }}
                                >
                                  {color.includes("green") ? (
                                    <MdCheckCircle className="w-4 h-4 mr-1" />
                                  ) : (
                                    <MdCancel className="w-4 h-4 mr-1" />
                                  )}
                                  {text}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      {/* Toggle Switch */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">
                          {reminder.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={() =>
                            toggleReminderStatus(reminder.id, reminder.status)
                          }
                          disabled={processingIds.has(reminder.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                            reminder.status === "ACTIVE"
                              ? "bg-emerald-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              reminder.status === "ACTIVE"
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteAppointmentReminder(reminder.id)}
                        disabled={processingIds.has(reminder.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-all duration-200"
                        title="Delete reminder"
                      >
                        {processingIds.has(reminder.id) ? (
                          <CircleSpinner loading={true} size={16} />
                        ) : (
                          <FaTrash className="w-4 h-4" />
                        )}
                      </button>

                      {/* Expand Button */}
                      {/* <button
                        onClick={() => toggleCardExpansion(reminder.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                      >
                        {expandedCards.has(reminder.id) ? (
                          <FaChevronUp className="w-4 h-4" />
                        ) : (
                          <FaChevronDown className="w-4 h-4" />
                        )}
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
