import useAudioStore from '@/store/useAudioStore'
import { MdOutlinePets, MdPeopleAlt } from 'react-icons/md'
import { components } from 'react-select'

// Customize Pet & Client dropdowns
export const CustomOption = props => {
  return (
    <components.Option {...props}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <MdOutlinePets style={{ marginRight: 5, fontSize: '18px' }} />
        <span style={{ marginRight: 10, width: '35%' }}>
          {props.data.petLabel}
        </span>
        <MdPeopleAlt style={{ marginRight: 5, fontSize: '18px' }} />
        <span style={{ width: '65%' }}>{props.data.clientLabel}</span>
      </div>
    </components.Option>
  )
}

// Customize Pet & Client dropdowns
export const CustomSingleValue = props => {
  return (
    <components.SingleValue {...props}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <MdOutlinePets style={{ marginRight: 5, fontSize: '18px' }} />
        <span style={{ marginRight: 10, width: '35%' }}>
          {props.data.petLabel}
        </span>
        <MdPeopleAlt style={{ marginRight: 5, fontSize: '18px' }} />
        <span style={{ width: '65%' }}>{props.data.clientLabel}</span>
      </div>
    </components.SingleValue>
  )
}

export const fetchWithAuth = (url, options = {}) => {
  return fetch(url, options).then(async response => {
    const { activeAppointment, downloadAudioFile, audioChunks } =
      useAudioStore.getState()

    if (response.status === 401) {
      // Download Recording if an active apppointment is being recorded and auth token expires
      if (activeAppointment && activeAppointment.status === 'RECORDING') {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' })
        await downloadAudioFile(audioBlob)
      }

      // If unauthorized, redirect to the login page
      window.location.href = '/api/auth/login'
      return Promise.reject(new Error('Unauthorized'))
    }
    return response
  })
}

export default {
  CustomOption,
  CustomSingleValue,
  fetchWithAuth,
}
