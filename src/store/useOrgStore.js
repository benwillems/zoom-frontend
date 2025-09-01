import { fetchWithAuth } from '@/utils/generalUtils'
import { create } from 'zustand'

const useOrgStore = create(set => ({
  details: null,
  setDetails: details => set({ details }),
  usersInOrg: [],
  roles: [],
  error: null,
  isAdmin: false,
  loading: true,
  teamIsLoading: true,
  activeTab: 'Organization',
  setActiveTab: tabName => set({ activeTab: tabName }),
  fetchOrgDetails: async router => {
    try {
      set({ loading: true })
      const response = await fetchWithAuth(`/api/organization`)
      if (response.status === 404) {
        throw new Error('Organization Details do not exist')
      }
      const data = await response.json()
      set({ details: data, loading: false, error: null })
      if (data.role) {
        set({ isAdmin: data.role.id === 1 })
      }
    } catch (error) {
      console.error('Fetching organization details failed:', error)
      set({ error: 'Organization not found', loading: false })
      if (error.message === 'Organization Details do not exist' && router) {
        // Redirect user to the /organization page if a 404 error occurs
        router.push('/organization')
      }
    }
  },
  createOrgDetails: async details => {
    try {
      const response = await fetchWithAuth('/api/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      })
      if (!response.ok) throw new Error('Network response was not ok')
      const newDetails = await response.json()
      set({ details: newDetails, error: null })
    } catch (error) {
      console.error('Creating organization details failed:', error)
    }
  },
  updateOrgDetails: async newDetails => {
    try {
      const response = await fetchWithAuth('/api/update-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDetails),
      })
      if (!response.ok) throw new Error('Network response was not ok')
      const updatedDetails = await response.json()
      set(state => ({
        details: {
          ...state.details,
          organization: updatedDetails.organization,
        },
        error: null,
      }))
    } catch (error) {
      console.error('Updating organization details failed:', error)
    }
  },
  fetchUsersInOrg: async () => {
    try {
      set({ teamIsLoading: true })
      const response = await fetchWithAuth('/api/organization/users')
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      set({ usersInOrg: data.users, teamIsLoading: false })
    } catch (error) {
      console.error('Fetching users in organization failed:', error)
      set({ teamIsLoading: false })
    }
  },
  fetchRoles: async () => {
    try {
      const response = await fetchWithAuth('/api/roles')
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      set({ roles: data.roles })
    } catch (error) {
      console.error('Fetching roles failed:', error)
    }
  },
  updateUserDetails: async userDetails => {
    try {
      const response = await fetchWithAuth('/api/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDetails),
      })
      if (!response.ok) throw new Error('Network response was not ok')
      const updatedUserResponse = await response.json()
      const updatedUser = updatedUserResponse.user
      set(state => {
        const updatedUsers = state.usersInOrg.map(user =>
          user.id === userDetails.id ? updatedUser : user
        )
        return {
          usersInOrg: updatedUsers,
          details: {
            ...state.details,
            name: updatedUser.name,
            phone: updatedUser.phone,
          },
          error: null,
        }
      })
    } catch (error) {
      console.error('Updating user details failed:', error)
    }
  },
}))

export default useOrgStore
