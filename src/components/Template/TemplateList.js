import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useAudioStore from '@/store/useAudioStore'
import Switch from 'react-switch'
import CircleSpinner from '../common/CircleSpinner'
import { fetchWithAuth } from '@/utils/generalUtils'

const TemplateList = () => {
  const router = useRouter()
  const {
    fetchUsersTemplates,
    fetchOrgsTemplates,
    templateOptions,
    defaultTemplate,
  } = useAudioStore()
  const [switchStatus, setStatusStatus] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    const fetchTemplates = async () => {
      await fetchUsersTemplates()
      setInitialLoad(false)
    }
    fetchTemplates()
  }, [])

  const handleSetDefault = async template => {
    try {
      const response = await fetchWithAuth('/api/template/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId: template?.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to update default template')
      }

      fetchUsersTemplates()
    } catch (error) {
      console.log('Error updating default for template', error)
    }
  }

  const preventPropagation = e => {
    e.stopPropagation()
  }

  const handleSwitchChange = async checked => {
    setStatusStatus(checked)
    setLoadingTemplates(true)
    if (checked) {
      await fetchOrgsTemplates()
    } else {
      await fetchUsersTemplates()
    }
    setLoadingTemplates(false)
  }

  let userOrOrg = switchStatus ? 'oganization' : 'user'

  if (initialLoad)
    return (
      <div className='flex justify-center w-full py-4'>
        <CircleSpinner loading={initialLoad} />
      </div>
    )

  return (
    <div className='bg-gray-50 rounded-lg px-2 sm:p-6'>
      <div className='mb-6'>
        <h3 className='text-3xl font-bold text-gray-900'>
          Templates ({userOrOrg})
        </h3>
        <p className='text-base text-gray-600'>
          Customize pre-built templates used for note generation.
        </p>
      </div>
      <div className='flex space-x-3 mb-2 px-1 items-center'>
        <h1 className='uppercase text-lg font-semibold'>User</h1>
        <Switch
          onChange={handleSwitchChange}
          checked={switchStatus}
          uncheckedIcon={false}
          checkedIcon={false}
          height={22}
          width={44}
          offColor='#020617'
          onColor='#020617'
          onHandleColor='#93c5fd'
          offHandleColor='#93c5fd'
        />
        <h1 className='uppercase text-lg font-semibold'>Organization</h1>
      </div>
      <div>
        <table className='table-fixed w-full'>
          <thead className='bg-blue-300'>
            <tr>
              <th className='text-left text-sm font-bold uppercase px-4 py-3'>
                Template Name
              </th>
              <th className='text-left text-sm font-bold uppercase px-4 py-3'>
                Type
              </th>
              <th className='text-left text-sm font-bold uppercase px-4 py-3'>
                Actions
              </th>
            </tr>
          </thead>
          {loadingTemplates ? (
            <tbody>
              <tr>
                <td colSpan='3' className='py-1'>
                  <div className='flex justify-center items-center'>
                    <CircleSpinner loading={loadingTemplates} />
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {templateOptions?.length > 0 &&
                templateOptions.map(template => (
                  <tr
                    key={template.id}
                    onClick={() => router.push(`/template/${template.id}`)}
                    className='bg-white border hover:bg-slate-200'
                  >
                    <td className='p-4 font-semibold text-sm text-gray-700'>
                      {template.name}
                    </td>
                    <td className='p-4'>
                      <div className='flex justify-center w-24 py-1 px-4 rounded-md border border-gray-400 bg-white text-sm'>
                        {template.type}
                      </div>
                    </td>
                    <td className='p-4'>
                      <div
                        className={`flex items-center gap-2 text-sm w-36 px-3 py-1 cursor-pointer rounded-md ${
                          defaultTemplate?.id === template.id
                            ? 'bg-blue-100 border border-black border-opacity-40'
                            : 'border border-gray-400 bg-white'
                        }`}
                        onClick={e => {
                          preventPropagation(e)
                          handleSetDefault(template)
                        }}
                      >
                        <input
                          type='checkbox'
                          checked={defaultTemplate?.id === template.id}
                          onChange={() => {}}
                          className='accent-blue-500 cursor-pointer'
                        />
                        <label className='select-none cursor-pointer'>
                          {defaultTemplate?.id === template.id
                            ? 'Current Default'
                            : 'Set as Default'}
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  )
}

export default TemplateList
