import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useAudioStore from "../../store/useAudioStore";
import TemplateSelect from "../../components/ui/common/TemplateSelect";
import { Tooltip } from "react-tooltip/dist/react-tooltip";
import { FaRegClock } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5";
import { MdOutlineCancel, MdWarning } from "react-icons/md";
import { FaRegCheckCircle } from "react-icons/fa";
import { fetchAllAppointments } from "@/store/actions/sharedActions";
import useNotificationStore from "@/store/useNotificationStore";

const Modal = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;
  const { activeAppointment, setActiveAppointment } = useAudioStore();
  const { addNotification } = useNotificationStore();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle No Show - ONLY updates status to NO_SHOW
  const handleNoShow = async () => {
    setLoading(true);
    try {
      // Use the noshow API endpoint for NO_SHOW status
      const response = await fetch(`/api/appointment/noshow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: activeAppointment?.id,
          status: "NO_SHOW",
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as No Show');
      }

      addNotification({
        iconColor: 'orange',
        header: 'Appointment marked as No Show!',
        description: `${activeAppointment?.client?.name}'s appointment has been marked as no show.`,
        icon: MdWarning,
        hideProgressBar: false,
      });

      setActiveAppointment(null);
      closeModal();
      await fetchAllAppointments();
    } catch (error) {
      console.error("Failed to mark as No Show:", error);
      addNotification({
        iconColor: 'red',
        header: 'Failed to mark as No Show',
        description: 'There was an error marking the appointment as no show.',
        icon: MdWarning,
        hideProgressBar: false,
      });
    }
    setLoading(false);
  };

  // Handle Template Submission - ONLY updates status to SUCCEEDED and submits template
  const handleSubmitTemplate = async () => {
    if (!selectedTemplate) {
      console.log("No template selected.");
      return;
    }

    setLoading(true);

    const payload = {
      templateId: selectedTemplate,
    };

    try {
      // Submit the template - this should also update status to SUCCEEDED
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
        addNotification({
          iconColor: 'red',
          header: 'Failed to submit template',
          description: 'There was an error submitting the template.',
          icon: MdWarning,
          hideProgressBar: false,
        });
      } else {
        console.log("Success");
        addNotification({
          iconColor: 'green',
          header: 'Template submitted successfully!',
          description: `Template has been submitted for ${activeAppointment?.client?.name}.`,
          icon: FaRegCheckCircle,
          hideProgressBar: false,
        });
        setActiveAppointment(null);
        closeModal();
      }
      await fetchAllAppointments();
    } catch (error) {
      console.error("Fetch error:", error);
      addNotification({
        iconColor: 'red',
        header: 'Error submitting template',
        description: 'An unexpected error occurred while submitting the template.',
        icon: MdWarning,
        hideProgressBar: false,
      });
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    closeModal();
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

        {/* Two separate buttons - No Show (left) and Submit Template (right) */}
        <div className="flex mt-4 gap-4">
          <button
            onClick={handleNoShow}
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md w-1/2 font-semibold"
            disabled={loading}
          >
            {loading ? "Processing..." : "Mark as No Show"}
          </button>
          <button
            onClick={handleSubmitTemplate}
            className="bg-blue-500 text-white py-2 px-4 rounded-md w-1/2 hover:bg-blue-600 font-semibold"
            disabled={!selectedTemplate || loading}
          >
            {loading ? "Processing..." : "Submit Template"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;