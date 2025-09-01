import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/router";
import Select from "react-select";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { RiCalendar2Line } from "react-icons/ri";
import useEscapeAndOutsideClick from "@/components/hooks/useEscapeAndOutsideClick";
import { fetchWithAuth } from "@/utils/generalUtils";
import { FaRegCheckCircle } from "react-icons/fa";
import { MdWarning, MdBlock } from "react-icons/md";
import useNotificationStore from '@/store/useNotificationStore'

const AddProgramToClient = ({
  clientId,
  onCancel,
  onConfirm,
  programToClient,
}) => {
  
  const router = useRouter();

  const { addNotification } = useNotificationStore.getState()

  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState("");
  const [alertInfo, setAlertInfo] = useState(null);
  const [isPorgramAdded, setIsProgramAdded] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (
      programToClient?.[0]?.ProgramStatus === "ACTIVE" ||
      programToClient?.[0]?.ProgramStatus === "PAUSED" ||
      programToClient?.[0]?.ProgramStatus === "SCHEDULED"
    ) {
      setShowWarning(true);
    }
  }, [programToClient?.[0]?.ProgramStatus]);

  // Ref for handling outside click
  const formRef = useRef(null);
  useEscapeAndOutsideClick(formRef, onCancel);

  useEffect(() => {
    fetchWithAuth("/api/organization/program")
      .then((response) => response.json())
      .then((data) => {
        setPrograms(
          data.map((program) => ({
            value: program.id.toString(),
            label: program.name,
            description: program.description,
            duration: program.duration,
            price: program.price,
          }))
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching programs:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setDisplayDate(
      selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
      })
    );
  }, [selectedDate]);

  const handleDateChange = (newDate) => {
    // Remove the past date restriction
    const adjustedDate = new Date(newDate.getTime());
    setSelectedDate(adjustedDate);
    setDisplayDate(
      adjustedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
      })
    );
    setIsCalendarVisible(false);
  };

  const handleProgramChange = (selectedOption) => {
    setSelectedProgram(selectedOption);
  };

  const handleSubmitInternal = async () => {
    if (!selectedProgram) {
      setAlertInfo({
        type: "error",
        message: "Please select a program before confirming.",
      });
      return;
    }

    const program = programs.find((p) => p.value === selectedProgram.value);
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + program.duration);
    const formattedEndDate = endDate.toISOString().split("T")[0];

    const payload = {
      programId: selectedProgram.value,
      clientId: clientId,
      startDate: selectedDate.toISOString().split("T")[0],
      endDate: formattedEndDate,
    };

        try {
      const response = await fetchWithAuth("/api/client/addprogram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    
      if (response.status === 200) { 
         addNotification({
          iconColor: "green",
          header: "Program has been added successfully!",
          icon: FaRegCheckCircle,
          hideProgressBar: false,
        });
      }
      else {
        const responseData = await response.json();

        addNotification({
          iconColor: "red",
          header: responseData.error,
          icon: MdBlock,
          hideProgressBar: false,
        });
      }
    
      if (onConfirm) {
        onConfirm(selectedProgram);
      }
      
    } catch (error) {
      addNotification({
        iconColor: "red",
        header: error,
        icon: MdBlock,
        hideProgressBar: false,
      });
    }
    
  };

  const closeAlert = () => {
    setAlertInfo(null);
    if (alertInfo?.type === "success") {
      onCancel();
    }
  };

  const isFormValid = () => {
    return selectedProgram && selectedDate;
  };

 

  return (
    <>
      
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
          <div
            className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl p-6"
            ref={formRef}
          >
            
            <header className="text-lg font-semibold text-gray-800 mb-4">
            Choose a Program for a Client
            </header>
            {alertInfo && (
              <div
                className={`mt-4 p-4 rounded-md ${
                  alertInfo.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <div className="flex items-center">
                  {alertInfo.type === "success" ? (
                    <FaRegCheckCircle className="mr-2" />
                  ) : (
                    <MdWarning className="mr-2" />
                  )}
                  <p>{alertInfo.message}</p>
                </div>
                <button onClick={closeAlert} className="mt-2 text-sm underline">
                  Close
                </button>
              </div>
            )}
            <div className="flex flex-col space-y-4">
            {showWarning && (
                  <div className="text-sm text-red-600 font-semibold mb-4">
                    If you add a new program, the existing one will be canceled
                  </div>
           )}
              {loading ? (
                
                <div className="text-center text-gray-600">
                  Loading programs...
                </div>
              ) : (
                <>
                  <Select
                    value={selectedProgram}
                    onChange={handleProgramChange}
                    options={programs}
                    placeholder="Select Program"
                    className="text-sm"
                  />
                  <div className="text-sm p-3 bg-gray-100 rounded-md h-28">
                    {selectedProgram ? (
                      <div className="text-left">
                        <h4 className="font-semibold mb-1">
                          {selectedProgram.label}
                        </h4>
                        <p className="text-sm">
                          <strong>Duration:</strong> {selectedProgram.duration}{" "}
                          days
                        </p>
                        <p className="text-sm ">
                          <strong>Price:</strong> ${selectedProgram.price}
                        </p>
                        <p className="text-sm truncate">
                          <strong>Description:</strong>{" "}
                          {selectedProgram.description}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-center text-gray-600">
                          Please select a program to see details
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Date"
                      value={displayDate}
                      onClick={() => setIsCalendarVisible(!isCalendarVisible)}
                      readOnly
                      className="w-full border-b-2 border-blue-300 placeholder-gray-700 outline-none py-2 pr-8"
                    />
                    {isCalendarVisible && (
                      <Calendar
                        value={selectedDate}
                        onChange={handleDateChange}
                        // Remove minDate={new Date()} to allow past dates
                        className="absolute z-10 mt-2 -translate-y-10"
                      />
                    )}
                    <div className="absolute right-2 top-2 text-gray-500">
                      <RiCalendar2Line size={18} />
                    </div>
                  </div>
                </>
              )}
            </div>
            <footer className="flex justify-end mt-6 space-x-4">
              <button
                onClick={onCancel}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 px-4 py-2 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInternal}
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  isFormValid()
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-blue-300 text-white cursor-not-allowed"
                }`}
                disabled={!isFormValid()}
                style={{
                  cursor: !isFormValid() ? "not-allowed" : "pointer",
                  position: "relative",
                }}
              >
                {!isFormValid()}
                Confirm
              </button>
            </footer>
          </div>
        </div>
      
    </>
  );
};

export default AddProgramToClient;