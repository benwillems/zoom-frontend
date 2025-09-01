"use client";

import React, { useEffect, useState } from "react";
import useAudioStore from "@/store/useAudioStore";
import Modal from "../zoom/ZoomModals";
import { FaRegCalendarCheck, FaLink } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5";
import { HiViewGrid } from "react-icons/hi";
import { BsLayoutSidebarInset } from "react-icons/bs";
import Link from "next/link";

// View selector component to toggle between layouts
const ViewSelector = () => {
  const { viewLayout, setViewLayout } = useAudioStore();

  return (
    <div className="flex items-center bg-white rounded-lg p-2 shadow-md">
     
      </div>
    // </div>
  );
};

const ZoomHeader = () => {
  const {
    activeAppointment,
    isMeetingActive,
    leaveMeeting,
    setZoomClient,
    activeMeeting,
    zoomClient,
    setIsMeetingActive,
    isModalOpen,
    setIsModalOpen,
    isMeetingClientLayoutActive,
  } = useAudioStore();

  // Always use horizontal layout
  const viewLayout = 'horizontal';

  const [isInitialized, setIsInitialized] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [initError, setInitError] = useState(null);

  // Initialize Zoom client when meeting becomes active
  useEffect(() => {
    if (isMeetingActive && !isInitialized) {
      console.log("Starting Zoom initialization...");
      setIsInitialized(true);
      initZoomClient();
    }
  }, [isMeetingActive, isInitialized]);

  // Effect for layout changes - reinitialize Zoom if layout changes
  useEffect(() => {
    if (isMeetingActive && isInitialized && zoomClient) {
      console.log("Layout changed, reinitializing Zoom...");
      zoomClient.leave();
      setTimeout(() => {
        initZoomClient();
      }, 500);
    }
  }, [viewLayout]);

  // Separate effect to handle joining when both client is ready and we have meeting details
  useEffect(() => {
    const attemptJoin = async () => {
      if (activeMeeting && clientReady && !isJoining && zoomClient) {
        try {
          setIsJoining(true);
          console.log("Attempting to join meeting from effect...");
          
          if (typeof zoomClient.join === 'function') {
            await zoomClient.join({
              meetingNumber: activeMeeting.meetingId,
              signature: activeMeeting.signature, 
              sdkKey: activeMeeting.sdkKey,
              userName: activeMeeting.userName,
              userEmail: activeMeeting.userEmail,
              password: activeMeeting.meetingPassword,
              role: 1,
              zak: activeMeeting.zakToken,
            });
            console.log("Successfully joined meeting");
          } else {
            console.error("zoomClient.join is not a function");
            setInitError("Join method not available");
          }
        } catch (error) {
          console.error("Error joining meeting:", error);
          setInitError(`Join error: ${error.message}`);
        }
      }
    };

    attemptJoin();
  }, [activeMeeting, clientReady, isJoining, zoomClient]);

  const initZoomClient = async () => {
    try {
      console.log("Loading Zoom SDK...");
      const ZoomEmbed = await import("@zoom/meetingsdk/embedded");
      
      if (!ZoomEmbed || !ZoomEmbed.default) {
        console.error("Failed to load Zoom SDK");
        setInitError("Failed to load Zoom SDK");
        return;
      }
      
      const client = ZoomEmbed.default.createClient();
      console.log("Zoom client created, waiting for element...");
      
      let attempts = 0;
      const maxAttempts = 20;
      
      const checkElement = () => {
        attempts++;
        const meetingElement = document.getElementById("headerMeetingSDKElement");
        
        if (meetingElement) {
          console.log("Found meeting element, initializing Zoom...");
          try {
            // Configure based on current layout
            const config = {
              language: "en-US",
              zoomAppRoot: meetingElement,
              customize: {
                video: viewLayout === 'horizontal' 
                  ? {
                      isResizable: false,
                      defaultViewType: "gallery",
                      viewSizes: {
                        default: { width: 300, height: 150 },
                        gallery: { width: 1000, height: 150 },
                        speaker: { width: 540, height: 170 },
                        ribbon: { width: 340, height: 170 },
                        active: { width: 300, height: 150 },
                      },
                      popper: {
                        disableDraggable: true,
                        placement: "bottom",
                        cssText: `
                          position: fixed !important;
                          top: 80px !important;
                          left: 50% !important;
                          transform: translateX(-50%) !important;
                          z-index: 9999 !important;
                        `
                      }
                    }
                  : {
                      isResizable: true,
                      disableDraggable: true,
                      defaultViewType: "ribbon",
                      viewSizes: {
                        default: { width: 230, height: 150 },
                        gallery: { width: 230, height: 150 },
                        speaker: { width: 230, height: 150 },
                        ribbon: { width: 335, height: 130 },
                        active: { width: 230, height: 150 },
                      },
                      popper: {
                        disableDraggable: true,
                        anchorElement: headerMeetingSDKElement,
                        placement: 'left',
                        cssText: `
                          position: fixed !important;
                          top: 20% !important;
                          right: 0 !important;
                          z-index: 9999 !important;
                        `
                      }
                    },
                toolbar: {
                  buttons: [
                    {
                      text: "End Meeting",
                      onClick: () => leaveMeeting(),
                      className:
                        "bg-red-500 hover:bg-red-600 text-white rounded px-3 py-1",
                    },
                  ],
                },
              },
            };
            
            client.init(config);
            console.log("Zoom client initialized");
            setZoomClient(client);
            
            // Give the client time to fully initialize before joining
            setTimeout(() => {
              console.log("Client should be ready now");
              setClientReady(true);
              setIsJoining(false); // Reset joining state when layout changes
            }, 1000);
            
          } catch (initError) {
            console.error("Error initializing Zoom:", initError);
            setInitError(`Init error: ${initError.message}`);
          }
        } else if (attempts < maxAttempts) {
          console.log(`Meeting element not found, checking again... (${attempts}/${maxAttempts})`);
          setTimeout(checkElement, 500);
        } else {
          console.error("Could not find meeting element after multiple attempts");
          setInitError("Element not found after timeout");
        }
      };

      checkElement();
      
    } catch (error) {
      console.error("Error loading Zoom SDK:", error);
      setInitError(`SDK error: ${error.message}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Link copied to clipboard");
    });
  };

  // Only render horizontal layout
  return (
    <div className='w-full h-auto bg-[#ecedeb] border-b-2 border-gray-300 shadow-xl'>
      <div className='flex flex-col'>
        {/* View selector */}
        <div className='absolute top-2 right-4 z-10'>
          <ViewSelector />
        </div>

        <div className='flex'>
          {/* Client Information Card (Left Side) */}
          {!isMeetingClientLayoutActive && (
            <div className='w-2/5 p-4 pl-20'>
              <div className='flex flex-col justify-start sm:justify-center h-full w-full'>
                <div className='flex bg-[#d9ded7] rounded-lg shadow-md border border-gray-200 overflow-hidden'>
                  <div className='flex flex-1 flex-col space-y-0 sm:space-y-0.5 p-4'>
                    <div className='flex justify-start items-center sm:space-x-1 text-base sm:text-2xl font-bold'>
                      <div className='w-5 sm:w-7'>
                        <IoPersonSharp />
                      </div>
                      <Link
                        href={`/clientDetails/${activeAppointment?.client?.id}`}
                        className='text-blue-600 hover:underline hover:underline-offset-4'
                      >
                        {activeAppointment?.client?.name}
                      </Link>
                    </div>

                    <div className='flex items-center space-x-4 flex-wrap'>
                      <div className='flex items-center sm:space-x-1'>
                        <div className='w-5 sm:w-7'>
                          <FaRegCalendarCheck className='text-base sm:text-2xl' />
                        </div>
                        <p className='text-sm sm:text-xl'>
                          {activeAppointment &&
                          activeAppointment.scheduleStartAt &&
                          activeAppointment.scheduleEndAt
                            ? `${new Date(
                                activeAppointment.scheduleStartAt
                              ).toLocaleTimeString([], {
                                hour: 'numeric',
                                minute: '2-digit',
                              })} to ${new Date(
                                activeAppointment.scheduleEndAt
                              ).toLocaleTimeString([], {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}`
                            : new Date(
                                activeAppointment?.date
                              ).toLocaleString([], {
                                weekday: 'short',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center ellipsis'>
                      <p className='text-xs sm:text-base'>
                        {activeAppointment?.description || ''}
                      </p>
                    </div>

                    <div className='w-full'>
                      {activeAppointment.zoomMeeting?.meetingJoinUrl && (
                        <div className='flex items-center space-x-3'>
                          <div className='flex items-center space-x-3'>
                            <FaLink className='w-6 h-6 text-black' />
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  activeAppointment.zoomMeeting
                                    .meetingJoinUrl
                                )
                              }
                              className='hidden sm:block text-blue-600 hover:underline hover:underline-offset-4 sm:space-x-1 text-base sm:text-2xl font-bold'
                            >
                              <span className='text-sm sm:text-xl truncate max-w-[150px] hidden sm:block text-blue-600 hover:underline hover:underline-offset-4'>
                                Zoom Link
                              </span>
                              <span className='sr-only'>Copy link</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Zoom Meeting Container - Adjusted width */}
          <div
            className={`bg-[#ecedeb] overflow-hidden h-[260px] ${
              isMeetingClientLayoutActive 
                ? 'w-auto min-w-[400px] max-w-[600px] mx-auto flex-shrink-0' 
                : 'w-[30%]'
            }`}
          >
            <div id='headerMeetingSDKElement' className='w-full h-full'></div>
            <div id='headerMeetingSDKChatElement' className='hidden'></div>
          </div>
        </div>

        {/* Modal for template selection */}
        <Modal isOpen={isModalOpen} closeModal={closeModal} />
      </div>
    </div>
  );
};

export default ZoomHeader;
