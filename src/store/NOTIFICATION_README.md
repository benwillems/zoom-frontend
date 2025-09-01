# Notifications

### How adding a Notification works

Zustand holds all the notifications the user sees, you can have multiple notifications displayed at a time. When `addNotification` is called it will add a new notification to the `notifications` array in Zustand. Then a component called `AppointmentList` will render the notifications and send specific notifications to different components either basic notifications or actionable notifications.

### How to add a notification and display it to the user

1. Import Store into your component

```js
import useNotificationStore from '@/store/useNotificationStore'
```

2. Call on `addNotification` method from Zustand

```js
const addNotification = useNotificationStore(state => state.addNotification)
```

#### Notification examples

Notifications are configurable you can simply leave out the description and progress bar.

**Actionable notification**:

```js
const handleActionClick = () => {
  console.log('Action clicked')
}

addNotification({
  header: 'Appointment for Coco has finished',
  description: 'View notes for Coco from Dr. Robert.',
  iconColor: 'green',
  icon: GrNotes,
  actions: [
    {
      label: 'See notes',
      onClick: handleActionClick,
    },
  ],
  hideProgressBar: false,
})
```

**Basic notification**:

```js
addNotification({
  iconColor: 'green',
  header: 'All notes copied!',
  description: 'You can now paste the notes anywhere',
  icon: FaRegCheckCircle,
  hideProgressBar: false,
})
```
