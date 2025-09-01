import { IoPersonSharp } from 'react-icons/io5'
import { useRouter } from 'next/router'
import useNotificationStore from '@/store/useNotificationStore'
import { FaRegCheckCircle } from 'react-icons/fa'

const ClientRow = ({ client }) => {
  const router = useRouter()
  const addNotification = useNotificationStore(state => state.addNotification)

  const handleRowClick = clientId => {
    router.push(`/clientDetails/${clientId}`)
  }

  const handleAddClient = clientData => {
    // Assuming an addClient function exists
    addClient({ ...clientData, clientId: client.id })
    addNotification({
      iconColor: 'green',
      header: `${clientData.name} was added!`,
      icon: FaRegCheckCircle,
      hideProgressBar: false,
    })
  }

  return (
    <tbody>
      <tr
        className='flex flex-col ease-in-out duration-75 border-b border-gray-300'
        onClick={() => handleRowClick(client?.id)}
      >
        <td className='flex justify-between py-4 cursor-pointer px-4 hover:bg-blue-100'>
          <div className='flex justify-center items-center space-x-2 text-sm sm:text-lg'>
            <IoPersonSharp />
            <h1>{client?.name}</h1>
          </div>
        </td>
      </tr>
    </tbody>
  )
}

export default ClientRow
