import { create } from 'zustand'
import { fetchWithAuth } from '@/utils/generalUtils'

const useExternalConnectorStore = create(set => ({
  externalConnector: null,
  setExternalConnector: externalConnector => set({ externalConnector }),
  pipelinesFromConnector: null,
  setPipelinesFromConnector: pipelinesFromConnector =>
    set({ pipelinesFromConnector }),
  contactsFromStage: null,
  setContactsFromStage: contactsFromStage => set({ contactsFromStage }),
}))

export default useExternalConnectorStore
