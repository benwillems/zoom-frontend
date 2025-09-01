import { fetchWithAuth } from '@/utils/generalUtils'
import useNotificationStore from '@/store/useNotificationStore'
import { create } from 'zustand'
import { FaRegCheckCircle } from 'react-icons/fa'
import { MdWarning } from 'react-icons/md'

const useSearchClientsStore = create((set, get) => ({
  searchQuery: '',
  clients: [],
  filteredPets: [],
  petErrorMessage: '',
  clientLoading: true,
  petLoading: true,
  setSearchQuery: query => set({ searchQuery: query }),
  setClients: clients => set({ clients }),
  setOrgDetails: orgDetails => set({ orgDetails }),
  fetchClients: async () => {
    try {
      set({ clientLoading: true })
      const response = await fetchWithAuth('/api/clients', {
        cache: 'no-store',
      })
      const data = await response.json()
      set({ clients: data, clientLoading: false })
    } catch (error) {
      console.error('Error fetching clients:', error)
      set({ clientLoading: false })
    }
  },
  addClient: async clientData => {
    const { addNotification } = useNotificationStore.getState()

    try {
      if (clientData?.email === '') {
        delete clientData?.email
      }

      if (clientData?.phone === '') {
        delete clientData?.phone
      }

      const response = await fetchWithAuth('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const newClient = await response.json()
      set(state => ({
        clients: [...state.clients, newClient],
        selectedClient: { value: newClient.id, label: newClient.name }, // Set newly created client as selected
      }))

      addNotification({
        iconColor: 'green',
        header: `${clientData.name} was added!`,
        icon: FaRegCheckCircle,
        hideProgressBar: false,
      })

      return newClient // Return the newly added client
    } catch (error) {
      console.error('Error:', error)
      addNotification({
        iconColor: 'red',
        header: `Failed to add client. Please try again.`,
        icon: MdWarning,
        hideProgressBar: false,
      })
      return null // Return null to indicate failure
    }
  },
}))

export default useSearchClientsStore
