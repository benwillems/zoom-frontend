import React, { useEffect } from 'react'
import Tabs from '@/components/ui/common/Tabs'
import OrganizationDetails from '@/components/ui/Organization/OrganizationDetails'
import { FaClinicMedical } from 'react-icons/fa'
import Team from '@/components/ui/Organization/TeamTab/Team'
import { RiTeamFill } from 'react-icons/ri'
import useOrgStore from '@/store/useOrgStore'
import CircleSpinner from '@/components/common/CircleSpinner'

const OrganizationPage = () => {
  const { fetchOrgDetails, loading } = useOrgStore()

  useEffect(() => {
    fetchOrgDetails()
  }, [])

  const tabContents = [
    {
      name: 'Organization',
      component: OrganizationDetails,
      icon: <FaClinicMedical />,
    },
    {
      name: 'Team',
      component: Team,
      icon: <RiTeamFill />,
    },
  ]

  return loading ? (
    <div className='flex justify-center w-full py-4'>
      <CircleSpinner loading={loading} />
    </div>
  ) : (
    <Tabs tabs={tabContents} />
  )
}

export default OrganizationPage
