'use client'

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useAudioStore from '../../store/useAudioStore';
import Modal from '../zoom/ZoomModals';
import { useRouter } from 'next/router';

const Meeting = () => {
  const { 
    leaveMeeting, 
    setZoomClient, 
    activeAppointment, 
    activeMeeting, 
    setActiveMeeting, 
    isMeetingActive, 
    zoomClient, 
    setIsMeetingActive, 
    isModalOpen, 
    setIsModalOpen,
    viewLayout
  } = useAudioStore();
  
  const router = useRouter();
  const [portalRoot, setPortalRoot] = useState(null);

  useEffect(() => {
    const portalDiv = document.createElement('div');
    portalDiv.id = 'zoom-portal';
    document.body.appendChild(portalDiv);
    setPortalRoot(portalDiv);
    initZoomClient();
    return () => {
      document.body.removeChild(portalDiv);
    };
  }, []);

  // Re-initialize when layout changes
  useEffect(() => {
    if (zoomClient && isMeetingActive) {
      try {
        zoomClient.leave();
      } catch (err) {
        console.log("No active meeting to leave");
      }
      
      setTimeout(() => {
        initZoomClient();
      }, 500);
    }
  }, [viewLayout]);

  const initZoomClient = async () => {
    new Promise(async (resolve, reject) => {
      try {
        const ZoomEmbed = await (await import('@zoom/meetingsdk/embedded')).default;
        resolve(ZoomEmbed.createClient());
      } catch (error) {
        reject(error);
      }
    })
    .then(async (zoomClient) => {
      const observer = new MutationObserver((mutations, obs) => {
        let meetingSDKElement = document.getElementById('meetingSDKElement');
        
        if (meetingSDKElement) {
          obs.disconnect();
          let meetingSDKChatElement = document.getElementById('meetingSDKChatElement');
          
          const config = {
            language: 'en-US',
            zoomAppRoot: meetingSDKElement,
            customize: {
              video: viewLayout === 'horizontal' 
                ? {
                    // Horizontal view - like second image
                    defaultViewType: "ribbon",
                    isResizable: false,
                    viewSizes: {
                      default: { width: 600, height: 180 },
                      gallery: { width: 600, height: 180 },
                      speaker: { width: 600, height: 180 },
                      ribbon: { width: 600, height: 180 },
                    },
                    layout: {
                      mode: "horizontal",
                      showScreenshareContent: false,
                    },
                    popper: {
                      disableDraggable: true,
                      anchorElement: meetingSDKElement,
                      placement: 'bottom',
                      cssText: `
                        position: fixed !important;
                        height: 180px !important;
                        max-height: 180px !important;
                        overflow: hidden !important;
                      `
                    }
                  }
                : {
                    // Vertical view - like second image
                    defaultViewType: "ribbon",
                    isResizable: false,
                    viewSizes: {
                      default: { width: 350, height: 180 },
                      gallery: { width: 350, height: 180 },
                      speaker: { width: 350, height: 180 },
                      ribbon: { width: 350, height: 180 },
                    },
                    layout: {
                      mode: "vertical",
                      showScreenshareContent: false,
                    },
                    popper: {
                      disableDraggable: true,
                      anchorElement: meetingSDKElement,
                      placement: 'left',
                      cssText: `
                        position: fixed !important;
                        top: 20% !important;
                        right: 0 !important;
                        z-index: 9999 !important;
                        height: 180px !important;
                        max-height: 180px !important;
                        overflow: hidden !important;
                      `
                    }
                  },
             
              toolbar: {
                buttons: [
                  {
                    text: 'End Meeting',
                    onClick: () => leaveMeeting(),
                  },
                ],
              }
            },
          };
          
          zoomClient.init(config);
          setZoomClient(zoomClient);
          
          if (activeMeeting) {
            setTimeout(() => {
              joinMeeting(zoomClient, activeMeeting);
            }, 1000);
          }
        } else {
          console.error('meetingSDKElement not found or not yet rendered!');
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    })
    .catch((error) => {
      console.error('Error initializing Zoom client:', error);
    });
  };

  const joinMeeting = (client, meetingDetails) => {
    if (!client || !meetingDetails) return;
    
    try {
      setIsMeetingActive(true);
      console.log("Joining meeting with:", meetingDetails);
      
      client.join({
        meetingNumber: meetingDetails.meetingId,
        signature: meetingDetails.signature,
        sdkKey: meetingDetails.sdkKey,
        userName: meetingDetails.userName,
        userEmail: meetingDetails.userEmail,
        password: meetingDetails.meetingPassword,
        role: 1,
        zak: meetingDetails.zakToken,
      });
    } catch (error) {
      console.error("Error joining meeting:", error);
    }
  };

  useEffect(() => {
    if (activeMeeting && zoomClient) {
      joinMeeting(zoomClient, activeMeeting);
    }
  }, [activeMeeting]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  
  useEffect(() => {
    if (isMeetingActive && activeAppointment?.client?.id) {
    
      router.push(`/clientDetails/${activeAppointment.client.id}`);

      if (typeof setIsMeetingClientLayoutActive === 'function') {
        setIsMeetingClientLayoutActive(true);
      }
    }
  }, [isMeetingActive, activeAppointment?.client?.id]);

  if (!portalRoot) return null;

  return createPortal(
    viewLayout === 'horizontal' ? (
      // Horizontal layout - fixed height like second image
      <div className="fixed top-[0%] left-[40%] flex flex-col space-y-4 p-1">
        <div id="meetingSDKElement" ></div>
        <div id="meetingSDKChatElement" className="z-50"></div>
        
        <div className='w-1/4'>
          <Modal isOpen={isModalOpen} closeModal={closeModal} />
        </div>
      </div>
    ) : (
      // Vertical layout - fixed height like second image
      <div className="fixed top-[17%] right-[0%] flex flex-col">
        <div id="meetingSDKElement" className="w-[350px] h-[180px] overflow-hidden"></div>
        <div id="meetingSDKChatElement" className="hidden"></div>
        
        <div className='w-1/4'>
          <Modal isOpen={isModalOpen} closeModal={closeModal} />
        </div>
      </div>
    ),
    portalRoot
  );
};

export default Meeting;