import React, { useEffect } from 'react'
import ProgramList from '@/components/Program/ProgramList'
import useOrgStore from '@/store/useOrgStore'
import { useRouter } from 'next/router'

const Programs = () => {
  const { details, fetchOrgDetails } = useOrgStore()

  const router = useRouter()

  useEffect(() => {
    // Effect to fetch organization details
    if (details === undefined || details === null) {
      fetchOrgDetails(router)
    }
  }, [])

  return (
    <div>
      <ProgramList />
    </div>
  )
}

export default Programs
