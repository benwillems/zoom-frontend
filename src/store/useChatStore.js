import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'

const useChatStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        clientId: null,
        setClientId: id => {
          set(state => ({
            clientId: id,
            chatConversation: state.chatConversations[id] || [],
          }))
        },
        chatConversations: {},
        addToConversation: newMessages => {
          set(state => {
            const updatedConversation = [
              ...state.chatConversation,
              ...newMessages,
            ]
            return {
              chatConversation: updatedConversation,
              chatConversations: {
                ...state.chatConversations,
                [state.clientId]: updatedConversation,
              },
            }
          })
        },
        clearConversation: () => {
          set(state => ({
            chatConversation: [],
            chatConversations: {
              ...state.chatConversations,
              [state.clientId]: [],
            },
          }))
        },
        chatLoading: false,
        setChatLoading: boolean => set({ chatLoading: boolean }),
        displayChatWindow: false,
        setDisplayChatwindow: boolean => set({ displayChatWindow: boolean }),
        isExpanded: false,
        setIsExpanded: boolean => set({ isExpanded: boolean }),
        appointmentReferencesFromChat: [],
        setAppointmentReferencesFromChat: references =>
          set({ appointmentReferencesFromChat: references }),
      }),
      {
        name: 'chat-store',
        getStorage: () => localStorage,
        partialize: state => ({
          clientId: state.clientId,
          chatConversations: state.chatConversations,
          // Add more state keys here as needed
        }),
      }
    )
  )
)

export default useChatStore
