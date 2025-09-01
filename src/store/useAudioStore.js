import { create } from 'zustand'
import useClientStore from '@/store/clientStore'
import { MdWarning } from 'react-icons/md'
import { FaMicrophoneLines } from 'react-icons/fa6'
import {
  fetchAllAppointments,
  fetchClients,
  addNotification,
} from './actions/sharedActions'
import { CgNotes } from 'react-icons/cg'
import { fetchWithAuth } from '@/utils/generalUtils'

const useAudioStore = create((set, get) => ({
  activeAppointment: null,
  activeMeeting: null,
  setActiveMeeting: activeMeeting => set({ activeMeeting }),
  setActiveAppointment: activeAppointment => set({ activeAppointment }),
  isPaused: false,
  mediaRecorder: null,
  isPausing: false,
  isResuming: false,
  isEnding: false,
  audioChunks: [],
  appointmentSet: new Set(),
  isSchedule: false,
  isNoteLoading: false,
  isMeetingActive: false,
  zoomClient: null,
  currentTimer: 0,
  startTime: null,
  timerInterval: null,
  calendarDate: new Date(),
  isEditSchedule: false,
  noAppointmentsForTheDay: false,
  templateId: null,
  templateOptions: [],
  defaultTemplate: null,
  isModalOpen: false,
  viewLayout: 'horizontal',
  isMeetingClientLayoutActive: false,

  setIsMeetingActive: isMeetingActive => set({ isMeetingActive }),
  setZoomClient: zoomClient => set({ zoomClient }),
  setIsPaused: isPaused => set({ isPaused }),
  setMediaRecorder: mediaRecorder => set({ mediaRecorder }),
  setIsPausing: isPausing => set({ isPausing }),
  setIsResuming: isResuming => set({ isResuming }),
  setIsEnding: isEnding => set({ isEnding }),
  setAppointmentSet: appointmentSet => set({ appointmentSet }),
  setIsSchedule: isSchedule => set({ isSchedule }),
  setIsNoteLoading: isNoteLoading => set({ isNoteLoading }),
  setCurrentTimer: currentTimer => set({ currentTimer }),
  setViewLayout: layout => set({ viewLayout: layout }),
  setIsMeetingClientLayoutActive: isMeetingClientLayoutActive =>
    set({ isMeetingClientLayoutActive }),
  setCalendarDate: calendarDate => {
    if (calendarDate instanceof Date) {
      set({ calendarDate })
    } else {
      console.error('Invalid calendarDate value:', calendarDate)
    }
  },
  setIsEditSchedule: isEditSchedule => set({ isEditSchedule }),
  setNoAppointmentsForTheDay: noAppointmentsForTheDay =>
    set({ noAppointmentsForTheDay }),
  setTemplateId: templateId => set({ templateId }),
  setTemplateOptions: templates => set({ templates }),
  setDefaultTemplate: defaultTemplate => set({ defaultTemplate }),
  setIsModalOpen: isModalOpen => set({ isModalOpen }),
  leaveMeeting: async () => {
    const { zoomClient, setIsModalOpen } = get()
    if (zoomClient) {
      zoomClient.endMeeting()
    }
    const { activeAppointment } = get()
    console.log(activeAppointment)
    try {
      const endMeeting = await fetch(
        `/api/meeting/end/${activeAppointment?.id}`,
        {
          method: "POST",
        }
      );

      if (!endMeeting.ok) {
        console.log("Error:", await endMeeting.text());
      } else {
        console.log("Success");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    set({ isMeetingActive: false })
    set({ activeMeeting: null })
    setIsModalOpen(true);
  },
  downloadAudioFile: async audioBlob => {
    const { activeAppointment } = get()
    if (activeAppointment && activeAppointment.client) {
      const clientName = activeAppointment.client.name
      const scheduleStartAt = activeAppointment.scheduleStartAt
      const formattedDate = new Date(scheduleStartAt).toISOString().slice(0, 10)
      const fileName = `${clientName}_${formattedDate}.mp3`
      const url = URL.createObjectURL(audioBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      console.error('Active appointment or client information not available')
    }
  },
  fetchMeetingData: async () => {
    const { activeAppointment, setActiveMeeting } = get()
    try {
      if (activeAppointment && activeAppointment.id) {
        const response = await fetch(`/api/appointment/${activeAppointment.id}/meetingdetails`, {
          method: 'GET'
        });
  
        const data = await response.json()
        setActiveMeeting(data)
      }
    } catch (error) {
      console.error('Error fetching meeting data:', error);
    }
  },
  // Function used to change styling across application to support RecordingBar overlay
  isOngoingAppointment: () => {
    const { activeAppointment } = get()
    const ongoingAppointmentStatus = ['RECORDING', 'PAUSED']
    return ongoingAppointmentStatus.includes(activeAppointment?.status)
  },
  fetchAppointmentSet: () => {
    const storedAppointments = localStorage.getItem('activeAppointments')
    let appointments
    if (storedAppointments) {
      appointments = new Set(JSON.parse(storedAppointments))
      set({ appointmentSet: appointments })
    } else {
      appointments = new Set()
    }
    return appointments
  },

  fetchUsersTemplates: async () => {
    try {
      const response = await fetchWithAuth('/api/user/templates')

      const data = await response.json()
      const defaultTemplate = data.templates.find(
        template => template.default === true
      )
      if (defaultTemplate) {
        set({ defaultTemplate: defaultTemplate })
        set({ templateId: defaultTemplate.id })
      }
      set({ templateOptions: data.templates })
    } catch (error) {
      console.log('Error fetching user templates')
    }
  },

  fetchOrgsTemplates: async () => {
    try {
      const response = await fetchWithAuth('/api/organization/templates')

      const data = await response.json()
      const defaultTemplate = data.templates.find(
        template => template.default === true
      )
      if (defaultTemplate) {
        set({ defaultTemplate: defaultTemplate })
        set({ templateId: defaultTemplate.id })
      }
      set({ templateOptions: data.templates })
    } catch (error) {
      console.log('Error fetching organization templates')
    }
  },

  addAppointmentIdToLocalStorage: id => {
    const appointments = get().fetchAppointmentSet()
    appointments.add(id)
    localStorage.setItem(
      'activeAppointments',
      JSON.stringify(Array.from(appointments))
    )
    set({ appointmentSet: appointments })
  },

  removeAppointmentIdFromLocalStorage: id => {
    const appointments = get().fetchAppointmentSet()
    appointments.delete(id)
    localStorage.setItem(
      'activeAppointments',
      JSON.stringify(Array.from(appointments))
    )
    set({ appointmentSet: appointments })
  },

  startRecording: async (clientId, clientName) => {
    try {
      await get().createAppointment(clientId, clientName)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = e => {
        get().audioChunks.push(e.data)
        set({ audioChunks: get().audioChunks })
      }
      recorder.start(1000)
      set({ mediaRecorder: recorder })
      set({ isPaused: false })
      set({ isPausing: false })
      set({ isEnding: false })
      set({ isResuming: false })
      set({ startTime: Date.now() })
      set({ currentTimer: 0 })

      const timerInterval = setInterval(() => {
        set({ currentTimer: Date.now() - get().startTime })
      }, 1000)
      set({ timerInterval })
      addNotification({
        iconColor: 'green',
        header: 'Recording started!',
        icon: FaMicrophoneLines,
        hideProgressBar: false,
      })
    } catch (err) {
      console.error('Error starting recording:', err)
      addNotification({
        iconColor: 'red',
        header: error?.message || 'Error starting recording',
        icon: MdWarning,
        hideProgressBar: true,
      })
    }
  },

  createAppointment: async (clientId, clientName) => {
    try {
      const { activeAppointment, setActiveAppointment } = get()
      const formData = new FormData()
      if (activeAppointment && activeAppointment.status === 'SCHEDULED') {
        formData.append('appointmentId', activeAppointment.id)
      } else if (clientId) {
        formData.append('clientId', clientId)
      } else if (clientName) {
        formData.append('clientName', clientName)
      } else {
        return
      }

      const response = await fetchWithAuth('/api/appointment/start', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setActiveAppointment(data.appointment)
      get().addAppointmentIdToLocalStorage(data.appointment.id)
      set({ isSchedule: false })
      set({ currentTimer: 0 })
      await fetchClients()
      await fetchAllAppointments()
    } catch (error) {
      console.error('Error creating appointment', error)
    }
  },

  endAppointment: async (audioFile, maxRetries = 3, retryDelay = 2000) => {
    const { activeAppointment, templateId } = get()
    const { fetchAllAppointments } = useClientStore.getState()
    if (
      activeAppointment &&
      activeAppointment.id &&
      (activeAppointment.status == 'RECORDING' ||
        activeAppointment.status == 'PAUSED')
    ) {
      set({ isEnding: true })
      const formData = new FormData()
      if (audioFile) {
        formData.append('audioFile', audioFile, 'appointment-audio.mp3')
      }
      formData.append('appointmentId', activeAppointment.id)
      formData.append('currentTimer', get().currentTimer)
      formData.append('templateId', templateId)

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetchWithAuth('/api/appointment/stop', {
            method: 'POST',
            body: formData,
          })
          if (!response.ok && response.status === 502) {
            console.log(
              `Retry #${attempt + 1} for /api/appointment/pause due to ${
                response.status
              } status`
            )
            await new Promise(resolve => setTimeout(resolve, retryDelay))
          } else if (response.status == 200) {
            get().removeAppointmentIdFromLocalStorage(activeAppointment.id)
            addNotification({
              iconColor: 'green',
              header: 'Note generated!',
              description: `Note for ${activeAppointment?.client?.name} was created.`,
              icon: CgNotes,
              hideProgressBar: false,
              notificationDisplayTimer: 8000,
            })
            await fetchAllAppointments()
            set({ isEnding: false })
            return true
          } else if (response.status == 400) {
            addNotification({
              iconColor: 'red',
              header: 'Failed to generate notes',
              icon: MdWarning,
              hideProgressBar: false,
            })
            return true
          }
        } catch (error) {
          console.error(
            `Retry #${attempt + 1} for /api/appointment/pause due to error:`,
            error
          )
          return false
        }
      }

      addNotification({
        iconColor: 'red',
        header: 'Error ending recording',
        icon: MdWarning,
        hideProgressBar: false,
      })
      set({ isEnding: false, isPaused: true })
      await fetchAllAppointments()
      return false
    }
  },

  stopRecording: async () => {
    const { mediaRecorder, activeAppointment, setActiveAppointment } = get()
    let success
    if (
      activeAppointment &&
      activeAppointment.id &&
      mediaRecorder &&
      mediaRecorder.state == 'recording'
    ) {
      clearInterval(get().timerInterval)
      const audioBlob = new Blob(get().audioChunks, { type: 'audio/mpeg' })
      success = await get().endAppointment(audioBlob)
      if (success) {
        mediaRecorder.onstop = async () => {
          set({ audioChunks: [] })
          setActiveAppointment(null)
          set({ isPaused: false })
          clearInterval(timerInterval)
        }
        mediaRecorder.stop()
      }
    } else {
      success = await get().endAppointment(null)
      if (success) {
        setActiveAppointment(null)
        set({ isPaused: false })
        clearInterval(get().timerInterval)
      } else {
        setActiveAppointment(activeAppointment)
        set({ isPaused: true })
      }
    }
  },

  pauseAppointment: async (audioFile, maxRetries = 3, retryDelay = 2000) => {
    const { fetchAllAppointments } = useClientStore.getState()
    const { activeAppointment, setActiveAppointment } = get()

    if (
      activeAppointment &&
      activeAppointment.id &&
      activeAppointment.status == 'RECORDING'
    ) {
      const formData = new FormData()
      formData.append('audioFile', audioFile, 'appointment-audio.mp3')
      formData.append('appointmentId', activeAppointment.id)
      formData.append('currentTimer', get().currentTimer)

      set({ isPausing: true })

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetchWithAuth('/api/appointment/pause', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok && response.status === 502) {
            console.log(
              `Retry #${attempt + 1} for /api/appointment/pause due to ${
                response.status
              } status`
            )
            await new Promise(resolve => setTimeout(resolve, retryDelay))
          } else if (response.status == 200) {
            const data = await response.json()
            setActiveAppointment(data.appointment)
            get().removeAppointmentIdFromLocalStorage(data.appointment.id)
            await fetchAllAppointments()
            set({ isPausing: false, isPaused: true })
            addNotification({
              iconColor: 'gray',
              header: 'Recording paused!',
              icon: FaMicrophoneLines,
              hideProgressBar: false,
            })
            return true // Return true to indicate success
          } else if (response.status == 400) {
            break // break out of loop to prevent 3 retry attempts on 400 error
          }
        } catch (error) {
          console.error(
            `Retry #${attempt + 1} for /api/appointment/pause due to error:`,
            error
          )
          return false
        }
      }

      set({ isPausing: false, isPaused: false })
      addNotification({
        iconColor: 'red',
        header: 'Error pausing recording',
        icon: MdWarning,
        hideProgressBar: false,
      })
      return false // Return false to indicate failure
    }
  },

  pauseRecording: async () => {
    const { mediaRecorder, activeAppointment } = get()
    if (
      activeAppointment &&
      activeAppointment.id &&
      mediaRecorder &&
      mediaRecorder.state === 'recording'
    ) {
      const localTimerInterval = get().currentTimer
      clearInterval(get().timerInterval)
      const audioBlob = new Blob(get().audioChunks, { type: 'audio/mpeg' })
      const success = await get().pauseAppointment(audioBlob)
      if (success) {
        mediaRecorder.onstop = async () => {
          set({ audioChunks: [] })
        }
        mediaRecorder.stop()
      } else {
        const startTime = Date.now() - localTimerInterval
        set({ startTime })
        set({ currentTimer: localTimerInterval })

        const timerInterval = setInterval(() => {
          set({ currentTimer: Date.now() - startTime })
        }, 1000)
        set({ timerInterval })
      }
    }
  },

  resumeAppointment: async () => {
    const { activeAppointment, setActiveAppointment } = get()
    const { fetchAllAppointments } = useClientStore.getState()
    if (activeAppointment && activeAppointment.id) {
      const formData = new FormData()
      formData.append('appointmentId', activeAppointment.id)
      set({ isResuming: true })
      try {
        const response = await fetchWithAuth('/api/appointment/resume', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        setActiveAppointment(data.appointment)
        get().addAppointmentIdToLocalStorage(activeAppointment.id)
        set({ isResuming: false })
        await fetchAllAppointments()
        addNotification({
          iconColor: 'blue',
          header: 'Recording resumed!',
          icon: FaMicrophoneLines,
          hideProgressBar: false,
        })
      } catch (error) {
        console.error('Error ending appointment', error)
        set({ isResuming: false })
        addNotification({
          iconColor: 'red',
          header: error?.message,
          icon: MdWarning,
          hideProgressBar: true,
        })
      }
    }
  },

  resumeRecording: async () => {
    const { activeAppointment } = get()
    if (activeAppointment && activeAppointment.id) {
      let recorder = get().mediaRecorder
      if (recorder == null) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        recorder = new MediaRecorder(stream)
        set({ mediaRecorder: recorder })
      }
      set({ isPaused: false })
      await get().resumeAppointment()
      recorder.ondataavailable = e => {
        get().audioChunks.push(e.data)
        set({ audioChunks: get().audioChunks })
      }
      recorder.start(1000)
      const startTime = Date.now() - activeAppointment.currentTimerMili
      set({ startTime })
      set({ currentTimer: activeAppointment.currentTimerMili })

      const timerInterval = setInterval(() => {
        set({ currentTimer: Date.now() - get().startTime })
      }, 1000)
      set({ timerInterval })
    }
  },

  cancelRecording: async () => {
    const { mediaRecorder, activeAppointment, setActiveAppointment } = get()
    const { fetchAllAppointments } = useClientStore.getState()
    if (activeAppointment && activeAppointment.id) {
      try {
        const formData = new FormData()
        formData.append('appointmentId', activeAppointment.id)
        await fetchWithAuth('/api/appointment/cancel', {
          method: 'POST',
          body: formData,
        })
        if (mediaRecorder) {
          mediaRecorder.onstop = async () => {
            set({ audioChunks: [] })
          }
          mediaRecorder.stop()
        }
        setActiveAppointment(null)
        set({ isPaused: false })
        set({ isEnding: false })
        set({ currentTimer: 0 })
        get().removeAppointmentIdFromLocalStorage(activeAppointment.id)
        await fetchAllAppointments()
        addNotification({
          iconColor: 'red',
          header: 'Recording cancelled!',
          icon: FaMicrophoneLines,
          hideProgressBar: false,
        })
        clearInterval(get().timerInterval)
      } catch (error) {
        console.error('Error pausing appointment', error)
        addNotification({
          iconColor: 'red',
          header: error,
          icon: MdWarning,
          hideProgressBar: true,
        })
      }
    }
  },

  uploadAudioFile: async (appointmentId, audioFile, clientId) => {
    const { fetchAllAppointments, fetchClientRecords } =
      useClientStore.getState()
    const { templateId } = get()
    set({ isNoteLoading: true })

    const formData = new FormData()
    formData.append('appointmentId', appointmentId)
    formData.append('audioFile', audioFile, 'appointment-audio.mp3')
    formData.append('templateId', templateId)

    try {
      const response = await fetchWithAuth('/api/appointment/upload-audio', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (response.status !== 200) {
        throw new Error(data?.message)
      }

      addNotification({
        iconColor: 'green',
        header: 'Note has been generated!',
        icon: CgNotes,
        hideProgressBar: false,
        notificationDisplayTimer: 8000,
      })
    } catch (error) {
      console.error('Error uploading audio file', error)
      addNotification({
        iconColor: 'red',
        header: 'Error uploading audio file',
        icon: MdWarning,
        hideProgressBar: true,
      })
    } finally {
      set({ isNoteLoading: false })
      await fetchAllAppointments()
      await fetchClientRecords(clientId)
    }
  },
}))

export default useAudioStore
