import React, { useEffect, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import KebabMenu from './KebabMenu'
import InviteMemberForm from './InviteMemberForm'
import useOrgStore from '@/store/useOrgStore'
import CircleSpinner from '@/components/common/CircleSpinner'

const Team = () => {
  const { usersInOrg, roles, fetchUsersInOrg, fetchRoles, teamIsLoading } =
    useOrgStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!usersInOrg?.length > 0) {
      fetchUsersInOrg()
    }
    if (!roles?.length > 0) {
      fetchRoles()
    }
  }, [])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const filteredTeamMembers = usersInOrg
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // This will sort the users based on the 'createdAt' field in descending order
    .filter(member =>
      member?.name?.toLowerCase().includes(searchQuery?.toLowerCase())
    )

  const formatDate = dateString => {
    if (!dateString) return 'Pending'
    const date = new Date(dateString)
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className='p-6'>
      <div className='flex flex-col items-start'>
        <h3 className='text-3xl font-bold text-gray-900'>Manage Team</h3>
        <p className='text-base text-gray-500'>
          Manage your organization's team members by inviting members and
          viewing individual team member information.
        </p>
      </div>
      <div className='flex items-center mt-6 space-x-4'>
        <div className='flex items-center w-96 bg-white border border-gray-600 rounded-md'>
          <CiSearch className='ml-2 text-lg md:text-2xl' />
          <input
            type='text'
            placeholder={'Search'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full py-1.5 px-1 md:px-3 text-base lg:text-base rounded-md font-semibold placeholder:text-gray-500 outline-none'
          />
        </div>
        <button
          className='uppercase text-sm lg:text-base text-black bg-blue-300 hover:bg-blue-400 py-2 px-6 rounded-md font-bold'
          onClick={openModal}
        >
          Invite Member
        </button>
      </div>
      {isModalOpen && (
        <div className='modal fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center'>
          <InviteMemberForm closeModal={closeModal} roleOptions={roles} />
        </div>
      )}
      {teamIsLoading ? (
        <div className='flex justify-start'>
          <CircleSpinner loading={teamIsLoading} />
        </div>
      ) : (
        <div className='mt-8 pb-32'>
          <table className='w-full bg-white border border-gray-200'>
            <thead>
              <tr className='bg-blue-300 text-black uppercase text-sm leading-normal'>
                <th className='py-3 px-6 text-left'>Name</th>
                <th className='py-3 px-6 text-left'>Role</th>
                <th className='py-3 px-6 text-left'>Email</th>
                <th className='py-3 px-6 text-left'>Date Added</th>
                <th className='py-3 px-6'></th>
              </tr>
            </thead>
            <tbody className='text-gray-600 text-sm'>
              {filteredTeamMembers?.map((member, index) => (
                <tr key={member?.id} className='border-b border-gray-200'>
                  <td className='flex items-center py-4 px-6 space-x-3'>
                    <p className='font-semibold'>{member?.name}</p>
                  </td>
                  <td className='py-3 px-6'>
                    {roles.find(role => role.id === member?.roleId)?.name ||
                      'Unknown Role'}
                  </td>
                  <td className='py-3 px-6'>{member?.email}</td>
                  <td className='py-3 px-6'>{formatDate(member?.createdAt)}</td>
                  <td className='py-3 px-6 text-right'>
                    <KebabMenu index={index} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Team
