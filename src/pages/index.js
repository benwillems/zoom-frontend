import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useSearchClientsStore from "@/store/useSearchClientsStore";
import ScheduledAppointments from "@/components/ui/Homepage/ScheduledAppointments";
import AudioRecorderHP from "@/components/audio/AudioRecordingHP";
import useClientStore from "@/store/clientStore";
import { MdOutlineCancel } from "react-icons/md";
import AppointmentDetails from "@/components/ui/Homepage/AppointmentDetails";
import DisplayNotesFromAppointment from "@/components/ui/Homepage/DisplayNotesFromAppointment";
import useAudioStore from "@/store/useAudioStore";
import MobileAudioRecorder from "@/components/Mobile/MobileAudioRecorder";
import ScheduleForm from "@/components/Mobile/ScheduleForm";
import ScheduleAppointmentHeader from "@/components/ui/Homepage/ScheduleAppointmentHeader";
import ActiveRecordingScreen from "@/components/Mobile/ActiveRecordingScreen";
import ActiveScreenBack from "@/components/Mobile/ActiveScreenBack";
import DisplayMessageAboutAppointment from "@/components/Mobile/DisplayMessageAboutAppointment";
import useOrgStore from "@/store/useOrgStore";
// import ReminderList from '@/components/ui/Homepage/ReminderList'
import ReminderList from "@/components/AppointmentReminder/AppointmentReminderComponent";
import { HiOutlineBell } from "react-icons/hi";

export default function HomeScreen() {
  const { fetchClients } = useSearchClientsStore();
  const { appointmentNote, setAppointmentNote, fetchAllAppointments } =
    useClientStore();
  const { details, fetchOrgDetails } = useOrgStore();
  const {
    activeAppointment,
    setActiveAppointment,
    setCalendarDate,
    isSchedule,
    setIsSchedule,
    isEditSchedule,
    setIsEditSchedule,
    noAppointmentsForTheDay,
    fetchUsersTemplates,
  } = useAudioStore();
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState("");
  const [windowWidth, setWindowWidth] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([
    "RECORDING",
    "SCHEDULED",
    "SUCCEEDED",
    "PAUSED",
    "SUCCEEDED",
    "NO_SHOW",
    "SUCCEEDED_MULTI",
    "PROCESSING",
    "GENERATING_NOTES",
    "FAILED",
    "USER_CANCELLED",
    "USER_DELETED",
    "WAITING_FOR_TEMPLATE_INPUT",
    "MEETING_ENDED",
    "MEETING_STARTED",
  ]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial window width
    setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Effect to fetch organization details
    if (details == undefined || details == null) {
      fetchOrgDetails(router);
    }
  }, []);

  useEffect(() => {
    if (details != undefined || details != null) {
      fetchClients();
      fetchAllAppointments();
      setAppointmentNote(null);
      // setActiveAppointment(null)
      setCalendarDate(new Date());
      fetchUsersTemplates();
    }
  }, [details]);

  const HIDE_BUTTONS_DUE_TO_STATUS = [
    "USER_CANCELLED",
    "USER_DELETED",
    "FAILED",
    "PROCESSING",
    "GENERATING_NOTES",
  ];

  return (
    <div className="flex flex-col h-dvh md:min-h-screen md:h-screen">
      <div className="flex flex-col sm:mt-0 lg:flex-row w-full pt-0 relative">
        {(isSchedule || isEditSchedule) && (
          <ScheduleForm
            onClose={() => {
              setIsSchedule(false);
              setIsEditSchedule(false);
              setSelectedClient(null);
              setSearchTerm("");
              fetchAllAppointments();
            }}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />
        )}
        {windowWidth !== null && windowWidth >= 640 && (
          <div className="flex flex-col sm:h-screen justify-start lg:mt-0 w-full lg:w-1/3 sm:border-r px-2 sm:border-gray-200 sm:pt-0">
            <ScheduleAppointmentHeader
              windowWidth={windowWidth}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatuses={selectedStatuses}
              setSelectedStatuses={setSelectedStatuses}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
            />
            <main className="flex-grow overflow-y-auto hide-scrollbar w-full">
              <ScheduledAppointments
                searchTerm={searchTerm}
                setSearchTerm={searchTerm}
                selectedStatuses={selectedStatuses}
              />
            </main>
          </div>
        )}
        <div className="sm:hidden">
          {activeAppointment?.status == "RECORDING" ||
          activeAppointment?.status == "PAUSED" ? (
            <div className="flex flex-col h-dvh">
              <div className="fixed top-0 z-30 h-14 w-full px-2 bg-lt-primary-off-white">
                <ActiveScreenBack setSearchTerm={setSearchTerm} />
              </div>
              <div className="flex-grow overflow-y-auto mt-14 mb-32 hide-scrollbar">
                <ActiveRecordingScreen />
              </div>
              <footer className="fixed bottom-0 w-full bg-lt-primary-off-white z-20">
                <MobileAudioRecorder
                  selectedClient={selectedClient}
                  setSelectedClient={setSelectedClient}
                />
              </footer>
            </div>
          ) : (
            <>
              {appointmentNote && (
                <DisplayNotesFromAppointment
                  setSelectedClient={setSelectedClient}
                  setSearchTerm={setSearchTerm}
                />
              )}
              {!appointmentNote && !isSchedule && !isEditSchedule && (
                <div className="flex flex-col h-dvh">
                  <div className="fixed top-0 z-30 h-24 w-full px-2 bg-lt-primary-off-white">
                    <ScheduleAppointmentHeader
                      windowWidth={windowWidth}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      selectedStatuses={selectedStatuses}
                      setSelectedStatuses={setSelectedStatuses}
                      selectedClient={selectedClient}
                      setSelectedClient={setSelectedClient}
                    />
                  </div>
                  <main
                    className={`flex-grow overflow-y-auto mt-24 ${
                      !noAppointmentsForTheDay ? "mb-32" : "mb-0"
                    } hide-scrollbar`}
                  >
                    <ScheduledAppointments
                      searchTerm={searchTerm}
                      setSearchTerm={searchTerm}
                      selectedStatuses={selectedStatuses}
                    />
                  </main>
                  {!noAppointmentsForTheDay && (
                    <footer className="fixed bottom-0 w-full bg-lt-primary-off-white z-20">
                      <MobileAudioRecorder
                        selectedClient={selectedClient}
                        setSelectedClient={setSelectedClient}
                      />
                    </footer>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="hidden sm:flex w-full lg:w-4/5 flex-col justify-center items-center lg:mb-0 sm:mt-0 px-4 lg:px-0">
          {appointmentNote && (
            <DisplayNotesFromAppointment
              setSelectedClient={setSelectedClient}
              setSearchTerm={setSearchTerm}
            />
          )}

          {!activeAppointment && (
            <div>
              {/* Header Section - now sticky */}
              <div
                className=" sticky top-0 z-10 bg-white pt-4 pb-4 flex items-center"
                style={{ borderRadius: "1rem 1rem 0 0" }}
              >
                <div className="flex items-center space-x-3 ml-6">
                  <div className="bg-blue-500 p-2 rounded-lg flex items-center justify-center">
                    <HiOutlineBell className="text-white text-2xl" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Appointment Reminders
                  </h1>
                </div>
              </div>
            </div>
          )}

          {!appointmentNote && (
            <div className="flex flex-col h-[650px] w-full lg:w-[90%] py-2 px-6 bg-white rounded-lg border mx-6 mt-8 mb-6 lg:mb-0 lg:mx-0 lg:mt-0  border-gray-200 shadow-lg">
              <div className="flex w-full items-center justify-between pb-2 border-b border-gray-200 relative">
                {activeAppointment ? (
                  <AppointmentDetails isUsedForNotes={false} />
                ) : (
                  // <div className='w-full'>
                  //   {/* <h1 className='text-2xl font-bold text-gray-800 mb-2'>
                  //     Appointment Reminders
                  //   </h1> */}
                  //   <ReminderList />
                  // </div>
                  <></>
                )}
                {activeAppointment && (
                  <button
                    disabled={activeAppointment?.status === "RECORDING"}
                    onClick={() => {
                      setActiveAppointment(null);
                      setAppointmentNote(null);
                      setSelectedClient(null);
                      setSearchTerm("");
                      fetchAllAppointments();
                    }}
                    className="text-red-400 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <MdOutlineCancel className="absolute top-0 right-0 mt-1 text-4xl " />
                  </button>
                )}
              </div>

              {/* Scrollable Reminder List */}
              {!activeAppointment && (
                <div
                  className="flex-1 min-h-0 hide-scrollbar"
                  style={{
                    overflowY: "auto",
                    maxHeight: "calc(650px - 56px)",
                    paddingRight: "2px",
                  }}
                >
                  <ReminderList />
                </div>
              )}
              {activeAppointment && (
                <div className="flex flex-col flex-grow">
                  <DisplayMessageAboutAppointment
                    activeAppointment={activeAppointment}
                  />

                  {!HIDE_BUTTONS_DUE_TO_STATUS.includes(
                    activeAppointment?.status
                  ) && (
                    <>
                      <div
                        className={`${activeAppointment ? "h-0" : "h-20"}`}
                      ></div>
                      <AudioRecorderHP
                        clientId={
                          typeof selectedClient?.value == "number"
                            ? selectedClient?.value
                            : null
                        }
                        clientName={
                          typeof selectedClient?.value == "string"
                            ? selectedClient?.value
                            : null
                        }
                        setSelectedClient={setSelectedClient}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
