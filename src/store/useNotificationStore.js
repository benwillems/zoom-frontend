import { create } from 'zustand'
import { nanoid } from 'nanoid'

const useNotificationStore = create(set => ({
  notifications: [],
  addNotification: notification => {
    set(state => ({
      notifications: [
        ...state.notifications,
        { id: nanoid(), ...notification },
      ],
    }))
  },
  removeNotification: id => {
    set(state => ({
      notifications: state.notifications.filter(
        notification => notification.id !== id
      ),
    }))
  },
}))

export default useNotificationStore
