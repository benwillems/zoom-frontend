import { create } from 'zustand'
import useAudioStore from './useAudioStore'
import useOrgStore from './useOrgStore'
import { fetchWithAuth } from '@/utils/generalUtils'

const useClientStore = create(set => ({
  clientDetails: null,
  setClientDetails: newDetails => set({ clientDetails: newDetails }),
  appointments: [],
  filteredAppointments: [],
  appointment: null,
  setAppointment: appointment => set({ appointment }),
  appointmentNote: null,
  setAppointmentNote: appointmentNote => set({ appointmentNote }),
  showClientRecordForm: false,
  setShowClientRecordForm: showClientRecordForm =>
    set({ showClientRecordForm }),
  events: [],
  setEvents: events => set({ events }),
  isAppointmentsLoading: false,
  clientCurrentTab: 'overview',
  setClientCurrentTab: clientCurrentTab => set({ clientCurrentTab }),
  isClientLoading: false,
  setIsClientLoading: isClientLoading => set({ isClientLoading }),
  isFetchingClientRecordings: false,
  multiClientsSelected: [],
  setMultiClientsSelected: multiClientsSelected =>
    set({ multiClientsSelected }),
  selectedCheckInDay: null,
  setSelectedCheckInDay: selectedCheckInDay => set({ selectedCheckInDay }),
  checkInGraphs: [],
  setCheckInGraphs: checkInGraphs => set({ checkInGraphs }),
  imageUrl: '/images/user_profile.jpg',
  setImageUrl: imageUrl => set({ imageUrl }),
  clientCheckIns: [],
  setClientCheckIns: clientCheckIns => set({ clientCheckIns }),
  isLoadingCheckIns: false,
  checkInError: null,
  // fetchAllAppointments: async () => {
  //   const { details } = useOrgStore.getState()
  //   if (!details) return null
  //   const { calendarDate } = useAudioStore.getState()
  //   const startDate = new Date(calendarDate)
  //   startDate.setHours(0, 0, 0, 0)

  //   // Get the midnight of the next day
  //   const endDate = new Date(startDate)
  //   endDate.setDate(endDate.getDate() + 1)

  //   const startParam = startDate
  //   const endParam = endDate

  //   const queryString = `status=SCHEDULED,SUCCEEDED,SUCCEEDED_MULTI,PAUSED,RECORDING,FAILED,USER_CANCELLED,USER_DELETED,PROCESSING,GENERATING_NOTES,MEETING_ENDED,WAITING_FOR_TEMPLATE_INPUT,MEETING_STARTED&startScheduleDate=${encodeURIComponent(
  //     startParam
  //   )}&endScheduleDate=${encodeURIComponent(endParam)}`

  //   set({ isAppointmentsLoading: true })
  //   fetchWithAuth(`/api/appointments?${queryString}`)
  //     .then(response => response.json())
  //     .then(data => {
  //       // Update the events in the store
  //       set({ events: data })
  //     })
  //     .catch(error => console.error('Error fetching appointments:', error))
  //     .finally(() => set({ isAppointmentsLoading: false }))
  // },




  fetchAllAppointments: async (abortSignal) => {
    const { details } = useOrgStore.getState()
    if (!details) return null
    const { calendarDate } = useAudioStore.getState()
    const startDate = new Date(calendarDate)
    startDate.setHours(0, 0, 0, 0)
  
    // Get the midnight of the next day
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)
  
    const startParam = startDate
    const endParam = endDate
  
    const queryString = `status=SCHEDULED,SUCCEEDED,SUCCEEDED_MULTI,PAUSED,RECORDING,NO_SHOW,FAILED,USER_CANCELLED,USER_DELETED,PROCESSING,GENERATING_NOTES,MEETING_ENDED,WAITING_FOR_TEMPLATE_INPUT,MEETING_STARTED&startScheduleDate=${encodeURIComponent(
      startParam
    )}&endScheduleDate=${encodeURIComponent(endParam)}`
  
    set({ isAppointmentsLoading: true })
    
    try {
      const response = await fetchWithAuth(`/api/appointments?${queryString}`, {
        signal: abortSignal // Add the abort signal here
      })
      const data = await response.json()
      // Update the events in the store
      set({ events: data })
    } catch (error) {
      // Only log errors that aren't abort errors
      if (error.name !== 'AbortError') {
        console.error('Error fetching appointments:', error)
      }
      // Re-throw non-abort errors
      if (error.name !== 'AbortError') {
        throw error
      }
    } finally {
      // Only update loading state if this request wasn't aborted
      if (abortSignal?.aborted !== true) {
        set({ isAppointmentsLoading: false })
      }
    }
  },







  // New action to handle fetching and updating appointments
  fetchClientRecords: async clientId => {
    if (clientId) {
      set({ isFetchingClientRecordings: true })

      try {
        const response = await fetchWithAuth(
          `/api/clients/${clientId}/appointments`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch appointments')
        }
        const data = await response.json()

        const currentDate = new Date()
        // Update store only once, to avoid multiple re-renders
        set(state => ({
          ...state,
          appointments: data,
          filteredAppointments: data
            .filter(
              event =>
                event.status === 'SCHEDULED' ||
                (event.status === 'SUCCEEDED' && event.notes !== null)
            )
            .map(event => ({
              ...event,
              // Adjusting for 'scheduleStartAt' for 'SCHEDULED' and 'date' for others
              formattedDate: new Date(
                event.status === 'SCHEDULED'
                  ? event.scheduleStartAt
                  : event.scheduleStartAt
              ).toLocaleDateString([], {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              sortDate: new Date(
                event.status === 'SCHEDULED'
                  ? event.scheduleStartAt
                  : event.scheduleStartAt
              ),
            }))
            .sort((a, b) => {
              // Prioritize 'SCHEDULED' status
              if (a.status === 'SCHEDULED' && b.status !== 'SCHEDULED')
                return -1
              if (b.status === 'SCHEDULED' && a.status !== 'SCHEDULED') return 1

              if (a.status === 'SCHEDULED' && b.status === 'SCHEDULED') {
                // For 'SCHEDULED' appointments, sort by closeness to current date
                return (
                  Math.abs(currentDate - a.sortDate) -
                  Math.abs(currentDate - b.sortDate)
                )
              }

              // Then, sort by date for remaining items (most recent first)
              return b.sortDate - a.sortDate
            }),
        }))

        // Find the latest appointment with non-empty notes.obstacles
        const latestAppointmentWithObstacles = data.reduce(
          (latest, appointment) => {
            if (
              appointment.status === 'SUCCEEDED' &&
              appointment.notes?.obstacles &&
              (!latest || appointment.date > latest.date)
            ) {
              return appointment
            }
            return latest
          },
          null
        )

        // Find the latest appointment with non-empty notes.recap_or_homework
        const latestAppointmentWithRecapOrHomework = data.reduce(
          (latest, appointment) => {
            if (
              appointment.status === 'SUCCEEDED' &&
              appointment.notes?.recap_or_homework &&
              (!latest || appointment.date > latest.date)
            ) {
              return appointment
            }
            return latest
          },
          null
        )

        // Update the clientDetails with the latest obstacles and recapOrHomework along with their respective dates
        set(state => ({
          clientDetails: {
            ...state.clientDetails,
            latestObstacles:
              latestAppointmentWithObstacles?.notes?.obstacles || '',
            latestObstaclesDate: latestAppointmentWithObstacles?.date || '',
            latestRecapOrHomework:
              latestAppointmentWithRecapOrHomework?.notes?.recap_or_homework ||
              '',
            latestRecapOrHomeworkDate:
              latestAppointmentWithRecapOrHomework?.date || '',
          },
        }))

        set({ isFetchingClientRecordings: false })
      } catch (error) {
        console.error('Error fetching client records:', error)
        set({ isFetchingClientRecordings: false })
      }
    }
  },
  fetchClientCheckIns: async clientId => {
    set({ isLoadingCheckIns: true, checkInError: null })

    try {
      const response = await fetchWithAuth(`/api/client/${clientId}/checkins`)

      if (!response.ok) {
        throw new Error('Failed to fetch client check-ins')
      }

      const checkInsData = await response.json()

      console.log('check in data', checkInsData)

      set({
        clientCheckIns: checkInsData?.checkIns,
        checkInGraphs: checkInsData?.graphs,
        isLoadingCheckIns: false,
      })
    } catch (error) {
      console.error('Error fetching client check-ins:', error)
      set({
        checkInError: error.message,
        isLoadingCheckIns: false,
      })
    }
  },
  resetCheckIns: () => {
    set({
      clientCheckIns: [],
      clientCurrentTab: 'overview',
      selectedCheckInDay: null,
    })
  },
}))

export default useClientStore
