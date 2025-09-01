import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useAudioStore from "../../store/useAudioStore";
import TemplateSelect from "../../components/ui/common/TemplateSelect";
import { Tooltip } from "react-tooltip/dist/react-tooltip";
import { FaRegClock } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5";
import { MdOutlineCancel, MdWarning } from "react-icons/md";
import { fetchAllAppointments } from "@/store/actions/sharedActions";
import useClientStore from "@/store/clientStore";

const Modal = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;
  const { activeAppointment, setActiveAppointment } = useAudioStore();
  const { addNotification } = useClientStore();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("SUCCEEDED");
  
  const [isNoShow, setIsNoShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isNoShow) {
      setSelectedStatus("NO_SHOW");
    } else {
      setSelectedStatus("SUCCEEDED");
    }
  }, [isNoShow]);


  const handleSelectTemplate = async (status) => {
    if (status === "NO_SHOW") {
      setLoading(true);
      await updateAppointmentStatus("NO_SHOW");
      setLoading(false);
      closeModal();
      router.push('/');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }

    if (!selectedTemplate) {
      console.log("No template selected.");
      return;
    }

    const payload = {
      templateId: selectedTemplate,
    };

    try {
      // First update the appointment status
      if (selectedStatus !== "SUCCEEDED") {
        await updateAppointmentStatus(selectedStatus);
      }

      const templateResponse = await fetch(
        `/api/meeting/template/${activeAppointment?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!templateResponse.ok) {
        console.log("Error:", await templateResponse.text());
      } else {
        console.log("Success");
        closeModal();
        
        // Redirect to home page first
        router.push('/');
        
        // Then reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    await fetchAllAppointments();
  };

  const updateAppointmentStatus = async (status) => {
    try {
      // Use the correct endpoint for no show status
      const response = await fetch(`/api/appointment/noshow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: activeAppointment?.id,
          status: status,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }

      // Show notification for no show
      // addNotification({
      //   iconColor: 'orange',
      //   header: 'Appointment marked as No Show!',
      //   icon: MdWarning,
      //   hideProgressBar: false,
      // });

      setActiveAppointment(null);
      fetchAllAppointments();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      // addNotification({
      //   iconColor: 'red',
      //   header: 'Failed to update appointment status',
      //   icon: MdWarning,
      //   hideProgressBar: false,
      // });
    }
  };

  const handleCloseModal = () => {
    closeModal();
    
    // Redirect to home page first
    router.push('/');
    
    // Then reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg md:max-w-md relative">
        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors duration-200"
          aria-label="Close modal"
        >
          <MdOutlineCancel className="size-7" />
        </button>

        <div className="flex flex-col shadow-lg bg-slate-100 pb-3 pt-2 mt-4">
          <div className="hidden sm:flex items-center space-x-1 text-xl font-bold pr-2">
            <IoPersonSharp />
            <p>{activeAppointment?.client?.name}</p>
          </div>

          <div className="flex items-center">
            <FaRegClock className="text-sm" />
            <p className="text-lg md:text-base text-black pl-1">
              {activeAppointment &&
              activeAppointment?.scheduleStartAt &&
              activeAppointment?.scheduleEndAt
                ? `${new Date(
                    activeAppointment?.scheduleStartAt
                  ).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })} to ${new Date(
                    activeAppointment?.scheduleEndAt
                  ).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}`
                : new Date(activeAppointment?.date).toLocaleString([], {
                    weekday: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
            </p>
          </div>
        </div>

       
        {!selectedTemplate ? (
          <div>
            <TemplateSelect
              flexCol={true}
              customClass="mb-8 mt-2"
              setSelectedTemplate={setSelectedTemplate}
            />
          </div>
        ) : (
          <div>
            <Tooltip
              id="generateNotes"
              style={{
                marginLeft: "-0px",
                padding: "3px 12px",
                width: "280px",
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
              }}
            />
            <TemplateSelect
              flexCol={true}
              customClass="mb-8 w-full mt-2"
              setSelectedTemplate={setSelectedTemplate}
            />
          </div>
        )}

        <div className="flex mt-4 gap-4">
          <button
            onClick={() => handleSelectTemplate("NO_SHOW")}
            className=" bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md w-1/2 hover:from-yellow-500 hover:to-orange-500 font-semibold"
            disabled={loading}
          >
            {loading ? "Processing..." : "Mark as No Show"}
          </button>
          <button
            onClick={() => handleSelectTemplate()}
            className="bg-blue-500 text-white py-2 px-4 rounded-md w-1/2 hover:bg-blue-600 font-semibold"
            disabled={!selectedTemplate || loading}
          >
            Submit Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;