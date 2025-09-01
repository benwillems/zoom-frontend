import React, { useState, useMemo, useEffect } from 'react'
import {
  FaCalendarAlt,
  FaTrash,
  FaPhoneAlt,
  FaRegCheckCircle,
} from 'react-icons/fa'
import MoreActions from '../common/table/MoreActions'
import { useRouter } from 'next/router'
import { IoPersonSharp } from 'react-icons/io5'
import { MdCallMerge, MdEmail, MdWarning, MdTrendingUp, MdCancel,} from 'react-icons/md'
import Alert from '../common/Alert'
import MergeClientModal from './MergeClientModal'
import { FaRegNoteSticky } from 'react-icons/fa6'
import useSearchClientsStore from '@/store/useSearchClientsStore'
import { fetchWithAuth } from '@/utils/generalUtils'
import useNotificationStore from '@/store/useNotificationStore'
import useAudioStore from '@/store/useAudioStore'
import { IoMdPlay, IoMdPause } from "react-icons/io";
import AddProgramToClient from "./AddProgramToClient";
import { pauseResumeProgram, cancelProgram } from "./ProgramToClient";
import ProgressStatusBar from "./../../Program/ProgramStatus";

const ClientTable = ({ clients, sortConfig, isClientModalOpen, showProgramModalAfterAdd, setShowProgramModalAfterAdd, currentAddClient, }) => {
  const router = useRouter()
  const { fetchClients } = useSearchClientsStore()
  const { addNotification, removeNotification } = useNotificationStore()
  const [showDeleteClientAlert, setShowDeleteClientAlert] = useState(false)
  const [showMergeClientModal, setShowMergeClientModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [showPauseResumeProgramAlert, setShowPauseResumeProgramAlert] = useState(false);
  const [showCancelProgramAlert, setShowCancelProgramAlert] = useState(false);
  const [showAddProgramToClient, setShowAddProgramToClient] = useState(false);
  const [clientDetails, setClientDetails] = useState(null);
  const [pauseResumeButton, setPauseResumeButton] = useState(null);
  const [cancelButton, setCancelButton] = useState(null);
  const [pauseResumeIcon, setPauseResumeIcon] = useState(null);
  const [openDropdownClientId, setOpenDropdownClientId] = useState(null);

  const handleRowClick = clientId => {
    router.push(`/clientDetails/${clientId}`)
  }
  const refreshClients = async () => {
    await fetchClients(); // Fetches updated client data
  };

  const isOngoingAppointment = useAudioStore(
    state => state.isOngoingAppointment
  )
  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      if (sortConfig.key) {
        const order = sortConfig.direction === 'asc' ? 1 : -1
        
        // Handle Progress sorting alphabetically by program name
        if (sortConfig.key === 'programProgress') {
          const aProgram = a?.ProgramToClient?.[0]?.program?.name || ''
          const bProgram = b?.ProgramToClient?.[0]?.program?.name || ''
          return aProgram.localeCompare(bProgram) * order
        }
        
        // Handle Last Appointment sorting with null values
        if (sortConfig.key === 'lastAppointmentDate') {
          const aDate = a.lastAppointmentDate
          const bDate = b.lastAppointmentDate
          
          // Both are null - keep original order
          if (!aDate && !bDate) return 0
          
          // One is null - null values go to end when ascending, beginning when descending
          if (!aDate) return order > 0 ? 1 : -1
          if (!bDate) return order > 0 ? -1 : 1
          
          // Both have dates - normal date comparison
          return new Date(aDate) < new Date(bDate) ? -order : order
        }
        
        // Default sorting for other columns
        return a[sortConfig.key] < b[sortConfig.key] ? -order : order
      }
      return 0
    })
  }, [clients, sortConfig])

  const formatDate = date => {
    return new Date(date).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const tableActions = [
    {
      label: 'Merge Client',
      onClick: () => setShowMergeClientModal(true),
      icon: <MdCallMerge className='rotate-90' />,
    },
    // {
    //   label: 'Delete Client',
    //   onClick: () => setShowDeleteClientAlert(true),
    //   icon: <FaTrash />,
    // },
    {
      label: "Add Program",
      onClick: () => setShowAddProgramToClient(true),
      icon: <FaCalendarAlt />,
    },
    ...(selectedClient?.ProgramToClient?.[0]?.ProgramStatus === "ACTIVE" ||
    selectedClient?.ProgramToClient?.[0]?.ProgramStatus === "FUTURE"
      ? [
          {
            label: "Pause",
            onClick: async () => {
              setPauseResumeButton("Pause");
              setPauseResumeIcon("IoMdPause");
              const id = selectedClient?.ProgramToClient?.[0]?.id;
              const clientId = selectedClient?.id;
              await pauseResumeProgram({ id, clientId });
              await refreshClients();
              addNotification({
                iconColor: "green",
                header: `Program ${selectedClient?.ProgramToClient?.[0]?.program?.name} for ${selectedClient?.name} has been paused.`,
                icon: FaRegCheckCircle,
                hideProgressBar: false,
              });
            },
            icon: <IoMdPause />,
          },
        ]
      : selectedClient?.ProgramToClient?.[0]?.ProgramStatus === "PAUSED"
      ? [
          {
            label: "Resume",
            onClick: async () => {
              setPauseResumeButton("Resume");
              setPauseResumeIcon("IoMdPlay");
              const id = selectedClient?.ProgramToClient?.[0]?.id;
              const clientId = selectedClient?.id;
              await pauseResumeProgram({ id, clientId });
              await refreshClients();
              addNotification({
                iconColor: "green",
                header: `Program ${selectedClient?.ProgramToClient?.[0]?.program?.name} for ${selectedClient?.name} has been resumed.`,
                icon: MdBlock,
                hideProgressBar: false,
              });
            },
            icon: <IoMdPlay />,
          },
        ]
      : []),
    ...(selectedClient?.ProgramToClient?.[0]?.ProgramStatus === "ACTIVE" ||
    selectedClient?.ProgramToClient?.[0]?.ProgramStatus === "FUTURE" ||
    selectedClient?.ProgramToClient?.[0]?.ProgramStatus === "PAUSED"
      ? [
          {
            label: "Cancel",
            onClick: async () => {
              setCancelButton("CANCEL");
              const id = selectedClient?.ProgramToClient?.[0]?.id;
              const clientId = selectedClient?.id;
              await cancelProgram({ id, clientId });
              await refreshClients();
              addNotification({
                iconColor: "red",
                header: `Program ${selectedClient?.ProgramToClient?.[0]?.program?.name} for ${selectedClient?.name} has been cancelled.`,
                icon: FaRegCheckCircle,
                hideProgressBar: false,
              });
            },
            icon: <MdCancel />,
          },
        ]
      : []),
  ]

  useEffect(() => {
    if (showProgramModalAfterAdd) {
      setShowAddProgramToClient(true); 
      setShowProgramModalAfterAdd(false); 
    }
  }, [showProgramModalAfterAdd]);

  const handleAddProgramToClient = async () => {
    setShowAddProgramToClient(false);
    await refreshClients(); 
  };

  const handleMergeClient = (
    clientIdGettingMergedAndDeleted,
    clientIdReceivingMerge
  ) => {
    let formData = new FormData()

    formData.append('fromClientId', clientIdGettingMergedAndDeleted)
    formData.append('toClientId', clientIdReceivingMerge)

    addNotification({
      id: 'process-merge',
      header: 'Processing client merge...',
      loading: true,
      hideProgressBar: true,
    })

    fetchWithAuth('/api/merge/clients', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        removeNotification('process-merge')
        fetchClients()
        setSelectedClient(null)
        setShowMergeClientModal(false)
        addNotification({
          iconColor: 'green',
          header: 'Client Merge has completed!',
          icon: FaRegCheckCircle,
          hideProgressBar: false,
        })
      })
      .catch(error => console.error('Error creating new appointment:', error))
      .finally(() => {
        removeNotification('process-merge')
        setSelectedClient(null)
        setShowMergeClientModal(false)
      })
  }

  useEffect(() => {
    setClientDetails(currentAddClient);
  }, [currentAddClient]);

  useEffect(() => {
    setClientDetails(selectedClient);
  }, [selectedClient]);

  return (
    <>
      <div
        className={`flex flex-col h-full ${
          isOngoingAppointment() ? 'pb-24' : ''
        }`}
      >
        <div className='flex-grow overflow-y-auto max-h-[calc(100vh-200px)] hide-scrollbar'>
          <table className='table-auto w-full'>
            <thead className={`bg-blue-300 sticky top-0`}>
              <tr className='text-black uppercase text-sm leading-normal'>
                <th className='text-left font-bold uppercase px-4 py-3'>
                  <div className='flex items-center'>
                    <IoPersonSharp className='mr-1.5' />
                    <span>Name</span>
                  </div>
                </th>
                <th className='text-left font-bold uppercase px-4 py-3'>
                  <div className='flex items-center'>
                    <FaPhoneAlt className='size-3 mr-1.5' />
                    <span>Phone</span>
                  </div>
                </th>
                <th className='text-left font-bold uppercase px-4 py-3'>
                  <div className='flex items-center'>
                    <MdEmail className='size-4 mr-1.5' />
                    <span>Email</span>
                  </div>
                </th>
                <th className='text-left font-bold uppercase px-4 py-3'>
                  <div className='flex items-center'>
                    <FaCalendarAlt className='mr-1.5' />
                    <span>Date Added</span>
                  </div>
                </th>
                <th className='text-left font-bold uppercase px-4 py-3'>
                  <div className='flex items-center'>
                    <FaRegNoteSticky className='size-4 mr-1.5' />
                    <span>Last Appointment</span>
                  </div>
                </th>
                <th className="text-center font-bold uppercase px-4 py-3">
                  <div className="flex items-center justify-center">
                    <MdTrendingUp className="size-4 mr-1.5" />
                    <span>Progress</span>
                  </div>
                </th>
                <th className='text-left font-bold uppercase px-4 py-3'>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedClients?.map(client => (
                <tr
                  key={client.id}
                  className='bg-white border hover:bg-slate-200 text-sm'
                >
                  <td
                    className='p-4 font-semibold text-gray-700 cursor-pointer'
                    onClick={() => handleRowClick(client?.id)}
                  >
                    {client.name}
                  </td>
                  <td className='p-4'>{client.phone || '-'}</td>
                  <td className='p-4'>{client.email || '-'}</td>
                  <td className='p-4'>{formatDate(client.createdAt)}</td>
                  <td className='p-4 text-center'>
                    {client?.lastAppointmentDate !== null
                      ? formatDate(client.lastAppointmentDate)
                      : '-'}
                  </td>
                  <td className="p-4">
                    <ProgressStatusBar clientDetails={client} />
                  </td>
                  <td className='p-4' onClick={() => setSelectedClient(client)}>
                    <MoreActions
                      tableActions={tableActions}
                      width='40'
                      isOpen={openDropdownClientId === client.id}
                      onOpen={() => {
                        setSelectedClient(client);
                        setOpenDropdownClientId(client.id);
                      }}
                      onClose={() => setOpenDropdownClientId(null)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showMergeClientModal && (
        <MergeClientModal
          clientReceivingMerge={selectedClient}
          show={showDeleteClientAlert}
          onCancel={() => setShowMergeClientModal(false)}
          onConfirm={handleMergeClient}
          Icon={MdCallMerge}
          buttonActionText='Merge Client'
        />
      )}

      {showDeleteClientAlert && (
        <Alert
          show={showDeleteClientAlert}
          title={`Delete ${selectedClient?.name}`}
          message='Are you sure you want to delete the client? This action can not be undone.'
          onCancel={() => setShowDeleteClientAlert(false)}
          onConfirm={() => {
            setSelectedClient(null)
            console.log('Delete Client')
            setShowDeleteClientAlert(false)
          }}
          Icon={MdWarning}
          buttonActionText='Delete Client'
        />
      )}


      {showAddProgramToClient && clientDetails?.id && (
        <>
          <AddProgramToClient
            clientId={clientDetails?.id}
            onCancel={() => setShowAddProgramToClient(false)}
            onConfirm={handleAddProgramToClient}
            programToClient={clientDetails?.ProgramToClient}
          />
        </>
      )}
    </>
  )
}

export default ClientTable
