import React, { useEffect, useState } from 'react'
import AppointmentLog from '../../AppointmentLog'
import InBodyCard from './InBodyCard'
import CalendarGraph from '../../Graphs/CalendarGraph'
import useClientStore from '@/store/clientStore'
import { useRouter } from 'next/router'
import { FaCalendarTimes, FaPlus } from 'react-icons/fa'
import CircleSpinner from '@/components/common/CircleSpinner'
import ProgramStatusBar from "@/components/Program/ProgramStatus";
import AddProgramToClient from "../../../Directory/AddProgramToClient";

const OverviewTab = () => {
  const router = useRouter()
  const { clientId } = router.query

  const {
    fetchClientCheckIns,
    clientCheckIns,
    isLoadingCheckIns,
    clientDetails,
    setSelectedCheckInDay,
  } = useClientStore()

  useEffect(() => {
    if (clientId !== undefined && clientId != clientDetails?.id) {
      fetchClientCheckIns(clientId)
      setSelectedCheckInDay(null)
    }
  }, [clientId])

  const [showDetails, setShowDetails] = useState(false);
  const [showAddProgramToClient, setShowAddProgramToClient] = useState(false);

  const isProgramEnrolled = clientDetails?.ProgramToClient?.[0]?.program?.name;

  const handleMouseEnter = () => {
    setShowDetails(true);
  };

  const handleMouseLeave = () => {
    setShowDetails(false);
  };

  const handleAddProgramClick = () => {
    setShowAddProgramToClient(true);
  };

  const handleAddProgramToClient = async () => {
    setShowAddProgramToClient(false);
    // Optionally refresh client data here if needed
  };

  const bodyFatData = [
    {
      id: 'Body Fat Percentage',
      data: [
        { x: 'March', y: 20.5 },
        { x: 'April', y: 19.8 },
        { x: 'May', y: 18.9 },
      ],
    },
  ]

  const muscleData = [
    {
      id: 'Skeletal Muscle Mass',
      data: [
        { x: 'March', y: 65.2 },
        { x: 'April', y: 66.1 },
        { x: 'May', y: 67.3 },
      ],
    },
  ]

  const weightData = [
    {
      id: 'Weight',
      data: [
        { x: 'March', y: 205 },
        { x: 'April', y: 203 },
        { x: 'May', y: 200 },
      ],
    },
  ]

  return (
    <div className='flex flex-col'>
      <div className="flex justify-between items-center px-4 pt-2 pb-6">
        <h2 className="text-xl font-bold">Program progress</h2>
        <button
          onClick={handleAddProgramClick}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
        >
          <FaPlus className="mr-2" />
          Add Program
        </button>
      </div>
      {isLoadingCheckIns ? (
        <div className="flex justify-center items-center h-48">
          <CircleSpinner loading={isLoadingCheckIns} height={48} width={48} />
        </div>
      ) : (
        <div className="flex flex-row justify-center items-center px-4 h-20 space-y-3 border mx-4 rounded-md mb-4 relative">
          <div className="flex flex-col space-x-3 mt-2 select-none w-2/5 justify-end">
            <ProgramStatusBar
              clientDetails={clientDetails}
              size="xl"
              weight="bold"
              showDetails={true} 
              onMouseEnter={handleMouseEnter} 
              onMouseLeave={handleMouseLeave} 
            />
          </div>

          {showDetails && (
            <div className="absolute right-[20%] bottom-0 mt-2 w-[20%] bg-white border rounded-lg shadow-xl z-50 max-h-20 ">
              <div className="p-2">
                <div className="mb-1 text-sm">
                  <span className="font-bold">Duration: </span>
                  <span>
                    {clientDetails?.ProgramToClient?.[0]?.program?.duration ||
                      "N/A"}
                  </span>
                </div>
                <div className="mb-1 text-sm">
                  <span className="font-bold">Price: </span>
                  <span>
                    ${clientDetails?.ProgramToClient?.[0]?.program?.price ||
                      "N/A"}
                  </span>
                </div>
                <div className="mb-1 text-sm truncate">
                  <span className="font-bold">Description: </span>
                  <span>
                    {clientDetails?.ProgramToClient?.[0]?.program
                      ?.description || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* <div className='flex justify-start items-start px-4 pt-2 pb-6 space-x-4'>
        <h2 className='text-xl font-bold'>Check-Ins Calendar</h2>
      </div>
      {isLoadingCheckIns ? (
        <div className='flex justify-center items-center h-48'>
          <CircleSpinner loading={isLoadingCheckIns} height={48} width={48} />
        </div>
      ) : clientCheckIns?.length > 0 ? (
        <CalendarGraph />
      ) : (
        <div className='flex flex-col justify-center items-center px-4 h-48 space-y-3 border mx-4 rounded-md mb-4'>
          <FaCalendarTimes className='size-8 text-blue-600' />
          <h1 className='text-xl font-medium uppercase'>
            {clientDetails?.checkInEnabled == false &&
            clientCheckIns?.length == 0
              ? `Check-Ins has not been setup for ${
                  clientDetails?.name?.split(' ')[0]
                }`
              : 'No Check-Ins have been completed'}
          </h1>
        </div>
      )} */}

      {/* <div className='flex justify-between px-4'>
        <InBodyCard data={bodyFatData} metric='Body Fat Percentage (%)' />
        <InBodyCard data={muscleData} metric='Skeletal Muscle Mass (%)' />
        <InBodyCard data={weightData} metric='Weight (lbs)' />
      </div> */}
      <AppointmentLog />

      {showAddProgramToClient && clientDetails?.id && (
        <AddProgramToClient
          clientId={clientDetails?.id}
          onCancel={() => setShowAddProgramToClient(false)}
          onConfirm={handleAddProgramToClient}
          programToClient={clientDetails?.ProgramToClient}
        />
      )}
    </div>
  )
}

export default OverviewTab
