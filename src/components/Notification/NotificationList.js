import React from 'react'
import useNotificationStore from '@/store/useNotificationStore'
import Notification from './Notification'
import ActionableNotification from './ActionableNotification'

const NotificationList = () => {
  const notifications = useNotificationStore(state => state.notifications)

  return (
    <div className='fixed top-4 right-4 sm:bottom-6 sm:right-10 z-50 space-y-4 h-20'>
      {notifications.map(notification =>
        notification.actions ? (
          <ActionableNotification key={notification.id} {...notification} />
        ) : (
          <Notification key={notification.id} {...notification} />
        )
      )}
    </div>
  )
}

export default NotificationList
