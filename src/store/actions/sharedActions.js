// sharedActions.js
import useClientStore from '../clientStore'
import useNotificationStore from '../useNotificationStore'
import useSearchClientsStore from '../useSearchClientsStore'

export const fetchAllAppointments = () => {
  return useClientStore.getState().fetchAllAppointments()
}

export const fetchClients = () => {
  return useSearchClientsStore.getState().fetchClients()
}

export const addNotification = notification => {
  return useNotificationStore.getState().addNotification(notification)
}
