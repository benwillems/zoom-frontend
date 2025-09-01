import React, { useState, useEffect } from "react";
import { FaVideo } from "react-icons/fa";
import { FaMicrophoneLines } from 'react-icons/fa6'
import Modal from "@/components/modals/WaitingModal.js";
import { fetchAllAppointments } from "@/store/actions/sharedActions";
import useAudioStore from "@/store/useAudioStore";

const AudioControls = ({ clientId, clientName }) => {
  const { 
    activeAppointment, 
    isMeetingActive, 
    fetchMeetingData, 
    setIsMeetingActive
  } = useAudioStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  
  const isScheduled = activeAppointment?.status === "SCHEDULED";
  const isWaitingForTemplateInput = activeAppointment?.status === "WAITING_FOR_TEMPLATE_INPUT";

  useEffect(() => {
    if (activeAppointment?.status === "WAITING_FOR_TEMPLATE_INPUT") {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [activeAppointment?.status]);

  // Start meeting with selected layout
  const startMeeting = async () => {
    if (!isScheduled) return;
    
    try {
      setIsStarting(true);
      
      // Fetch meeting data (signature, token, etc.)
      await fetchMeetingData();
      
      // Update meeting status on the server
      await fetch(`/api/meeting/start/${activeAppointment?.id}`, {
        method: "POST",
      });
      
      // Refresh appointments list
      await fetchAllAppointments();
      
      // Meeting is now active
      setIsMeetingActive(true);
      setIsStarting(false);
    } catch (error) {
      console.error("Error starting meeting:", error);
      setIsStarting(false);
    }
  };

  // Main meeting button; uses smaller sizes on mobile
  const renderMeetingButton = (isMobile = false) => {
    const sizeClass = isMobile ? "h-16 w-16" : "h-48 w-48";
    const textSize = isMobile ? "text-xs" : "text-lg";
    const iconSize = isMobile ? "h-7 w-7" : "h-12 w-12";
    
    if (isMeetingActive) {
      return (
        <div className={`${sizeClass} flex flex-col items-center justify-center bg-gray-600 rounded-full text-white`}>
          <span className={`font-bold text-center px-2 ${textSize}`}>Meeting in Progress</span>
          <span className={`mt-2 text-gray-300 ${textSize}`}>
            {/* {viewLayout === 'horizontal' ? 'Top View' : 'Side View'} Active */}
            Top View Active
          </span>
        </div>
      );
    }
    
    return (
      <button
        className={`flex-col rounded-full transition-all duration-300 flex items-center justify-center ${sizeClass} ${
          isScheduled
            ? "bg-blue-600 hover:bg-blue-700 hover:scale-105 cursor-pointer shadow-lg"
            : "bg-gray-500 cursor-not-allowed"
        }`}
        onClick={startMeeting}
        disabled={!isScheduled}
      >
        {!isMobile && (
          <span className={`${textSize} font-bold mb-2 text-white text-center px-2`}>
            {isScheduled ? "Start Zoom Meeting" : "Meeting Completed"}
          </span>
        )}
        {isMobile ? (
          <FaMicrophoneLines className={`${iconSize} text-white`} />
        ) : (
          <FaVideo className={`${iconSize} text-white`} />
        )}
      </button>
    );
  };

  return (
    <>
      {/* Desktop View */}
      {/* <div className="hidden sm:flex flex-col w-full flex-grow justify-between items-center relative text-black">
        <div className="flex-grow flex flex-col justify-center items-center">
          <div className="relative">
            {renderMeetingButton()}
          </div>
        </div>
      </div> */}


          {/* Desktop View */}
    {activeAppointment && (
      <div className="hidden sm:flex flex-col w-full flex-grow justify-between items-center relative text-black">
        <div className="flex-grow flex flex-col justify-center items-center">
          <div className="relative">
            {renderMeetingButton()}
          </div>
        </div>
      </div>
    )}

      {/* Mobile View */}
      <div className="sm:hidden flex flex-col w-full flex-grow justify-center items-center relative">
        <div className="relative">
          {/* {renderMeetingButton()} */}
          {renderMeetingButton(true)}
        </div>
      </div>

      {/* Template selection modal */}
      <Modal
        isOpen={isModalOpen} 
        closeModal={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default AudioControls;