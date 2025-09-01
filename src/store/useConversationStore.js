// conversationStore.js
import { create } from 'zustand'
import { fetchWithAuth } from '@/utils/generalUtils'

const useConversationStore = create((set, get) => ({
  conversations: [],
  selectedConversation: null,
  setConversations: conversations => set({ conversations }),
  isLoadingInbox: false,
  isLoadingConversation: true,
  setIsLoadingConversation: isLoadingConversation =>
    set({ isLoadingConversation }),
  setSelectedConversation: conversation =>
    set({ selectedConversation: conversation }),
  fetchLatestMessages: async () => {
    try {
      set({ isLoadingInbox: true })
      const response = await fetchWithAuth('/api/clients/latest/messages')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      set({ conversations: data })
    } catch (error) {
      console.error('Error fetching latest messages:', error)
    } finally {
      set({ isLoadingInbox: false })
    }
  },
  updateUnreadCount: conversationId => {
    set(state => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId ? { ...conv, unreadMessageCount: 0 } : conv
      ),
    }))
  },
}))

export default useConversationStore
