import React, { useEffect, useState } from 'react'
import Template from '@/components/Template/Template'
import { fetchWithAuth } from '@/utils/generalUtils'
import { useRouter } from 'next/router'

const TemplateDetailsPage = () => {
  const router = useRouter()
  const { templateId } = router.query

  const [template, setTemplate] = useState(null)

  useEffect(() => {
    if (templateId) {
      fetchWithAuth(`/api/template/${templateId}`)
        .then(response => response.json())
        .then(data => setTemplate(data))
    }
  }, [templateId])

  return <Template template={template} templateId={parseInt(templateId)} />
}

export default TemplateDetailsPage
