import React, { useEffect } from 'react'
import TemplateList from '@/components/Template/TemplateList'
import useOrgStore from '@/store/useOrgStore'
import { useRouter } from 'next/router'

const Templates = () => {
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
      <TemplateList />
    </div>
  )
}

export default Templates
