import { create } from 'zustand';

const useZoomStore = create((get, set) => ({
  isMeetingActive: false,
  client: null, // Store client in Zustand

  // Function to start a meeting
  startMeeting: (appointmentId) => set({
    isMeetingActive: true, 
    client: get().client, 
    activeAppointmentId: appointmentId // Store the appointment ID
  }),


  // Function to handle leaving the meeting
  leaveMeeting: () => set((state) => {
    if (state.client) {
      state.client.endMeeting(); // Call the client's leaveMeeting method
    }
    return { isMeetingActive: false, client: null}; // Reset meeting status and client in the store
  }),
}));

export default useZoomStore;
