'use client'

import React, { useState, useEffect } from 'react'
import { MdPeopleAlt } from 'react-icons/md'
import { FaCalendar, FaClinicMedical } from 'react-icons/fa'
import { MdRecordVoiceOver } from 'react-icons/md'
import { Tooltip } from 'react-tooltip'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { IoMdNutrition } from 'react-icons/io'
import { HiTemplate } from 'react-icons/hi'
import { HiChatBubbleOvalLeft, HiFunnel } from 'react-icons/hi2'
import { useUser } from '@auth0/nextjs-auth0/client'
import { LuDoorOpen } from 'react-icons/lu'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { FaVideo } from 'react-icons/fa'
import Image from 'next/image'
import useAudioStore from '@/store/useAudioStore'
import { SiAlwaysdata } from 'react-icons/si'

const Sidebar = ({ onToggle, forceCollapsed = false }) => {
  const [selectedNavItem, setSelectedNavItem] = useState('Home')
  // Start collapsed by default
  const [isCollapsed, setIsCollapsed] = useState(true)
  const { user } = useUser()
  const { isMeetingActive, activeAppointment } = useAudioStore()
  const router = useRouter()

  // Handle force collapse during meetings only if not already manually collapsed
  useEffect(() => {
    if (forceCollapsed && isMeetingActive) {
      setIsCollapsed(true)
    }
  }, [forceCollapsed, isMeetingActive])

  // Notify parent component when sidebar state changes
  useEffect(() => {
    if (onToggle) {
      onToggle(isCollapsed)
    }
  }, [isCollapsed, onToggle])

  const handleLogout = async e => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/custom-logout', { method: 'POST' })
      if (res.ok) {
        router.push('/api/auth/login')
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  let links = [
    {
      name: 'Record Now',
      href: '/',
      icon: <MdRecordVoiceOver className='text-2xl' />,
    },
    {
      name: 'Directory',
      href: '/directory',
      icon: <MdPeopleAlt className='text-2xl' />,
    },
    {
      name: 'Conversations',
      href: '/conversations',
      icon: <HiChatBubbleOvalLeft className='text-2xl' />,
    },
    {
      name: 'Schedule',
      href: '/schedule',
      icon: <FaCalendar className='text-2xl' />,
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: <HiTemplate className='text-2xl' />,
    },
    {
      name: 'Programs',
      href: '/programs',
      icon: <HiTemplate className='text-2xl' />,
    },
    {
      name: 'Leads',
      href: '/leads',
      icon: <HiFunnel className='text-2xl' />,
    },
     {
      name: 'Analytics',
      href: '/analytics',
      icon: <SiAlwaysdata className='text-2xl' />,
    },
    {
      name: 'Organization',
      href: '/organization',
      icon: <FaClinicMedical className='text-2xl' />,
    },
  ]

  // Always allow manual toggle, even during meetings
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className='h-full fixed z-20'>
      <div
        className={`flex flex-col h-full sticky top-0 bg-secondary-dark border-r border-primary-dark-light transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-16 13Inch:w-[205px]'
        }`}
      >
        {/* Toggle Button - always enabled */}
        <button
          onClick={handleToggle}
          className={`absolute -right-3 top-6 bg-secondary-dark border border-primary-dark-light rounded-full p-1 text-primary-white hover:bg-zinc-600 transition-colors duration-200 z-30 hidden 13Inch:block`}
        >
          {isCollapsed ? (
            <FiChevronRight className='w-4 h-4' />
          ) : (
            <FiChevronLeft className='w-4 h-4' />
          )}
        </button>

        {/* Header */}
        <Link
          href='/'
          className='flex items-center justify-center my-7 px-2 text-primary-white'
        >
          {!isCollapsed ? (
            <Image
              src='/images/coachally-logo2.png'
              alt='CoachAlly Logo'
              width={150}
              height={50}
              className='hidden 13Inch:block'
            />
          ) : (
            <div>
              <Image
                src='/images/coachally-logo2.png'
                alt='CoachAlly Logo'
                width={222}
                height={92}
              />
            </div>
          )}
          {/* Fallback for mobile when not collapsed */}
          {!isCollapsed && (
            <div className='block 13Inch:hidden text-2xl font-bold text-primary-white'>
              C
            </div>
          )}
        </Link>

        {/* Divider */}
        <div
          className={`flex ml-auto mr-auto bg-primary-dark-light h-0.5 transition-all duration-300 ${
            isCollapsed ? 'w-14' : 'w-14 13Inch:w-[185px]'
          }`}
        ></div>

        {/* Nav Items */}
        <div className='mt-2'>
          {/* Meeting Active Button - Show at top when meeting is active */}
          {isMeetingActive && activeAppointment?.client?.id && (
            <Link href={`/clientDetails/${activeAppointment.client.id}`}>
              <div
                className='flex items-center justify-center 13Inch:justify-start px-3 py-2 my-2 mx-4 rounded-md bg-green-600 text-white hover:bg-green-500 cursor-pointer transition-all duration-300 animate-pulse'
                data-tooltip-id='meeting-active-tooltip'
                data-tooltip-content='Return to Active Meeting'
                data-tooltip-place='right'
              >
                <div className='shrink-0'>
                  <FaVideo className='text-xl' />
                </div>
                {!isCollapsed && (
                  <div className='ml-2 hidden 13Inch:block'>
                    <h1 className='font-semibold'>Meeting Active</h1>
                    <p className='text-xs text-green-100 truncate'>
                      {activeAppointment?.client?.name}
                    </p>
                  </div>
                )}
                <Tooltip
                  id='meeting-active-tooltip'
                  className={`font-medium !bg-green-600 !text-white !px-2 !py-1 ${
                    isCollapsed ? '' : '13Inch:hidden'
                  }`}
                />
              </div>
            </Link>
          )}

          {links.map((link, index) => (
            <Link href={link.href} key={index}>
              <div
                className={`flex items-center justify-center 13Inch:justify-start px-3 py-1.5 my-2 mx-4 rounded-md ${
                  selectedNavItem == link.name
                    ? ' text-primary-white'
                    : 'text-zinc-500'
                }  hover:bg-zinc-600 hover:mx-2.5 hover:text-primary-white cursor-pointer ease-in-out duration-300 ${
                  isCollapsed ? '13Inch:justify-center' : '13Inch:space-x-2'
                }`}
                onClick={() => setSelectedNavItem(link.name)}
                data-tooltip-id={`id-${link.name}`}
                data-tooltip-content={link.name}
                data-tooltip-place='right'
              >
                <div className='shrink-0'>{link.icon}</div>
                {!isCollapsed && (
                  <h1 className='ml-2 hidden 13Inch:block'>{link.name}</h1>
                )}
                <Tooltip
                  id={`id-${link.name}`}
                  className={`font-medium !bg-primary-dark-light !text-primary-white !px-2 !py-1 ${
                    isCollapsed ? '' : '13Inch:hidden'
                  }`}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* User Profile and Logout */}
        <div className='mt-auto mb-4 px-4'>
          {user && !isCollapsed && (
            <div className='flex items-center justify-center space-x-2'>
              <div className='avatar'>
                <div className='w-9 rounded-full'>
                  <img
                    alt='NutriAssistImg'
                    src={user.picture || '/images/nutri_assist_profile.png'}
                  />
                </div>
              </div>

              <span className='hidden 13Inch:inline text-primary-white'>
                {user.name}
              </span>
            </div>
          )}

          {user && isCollapsed && (
            <div className='flex items-center justify-center mb-2'>
              <div className='avatar'>
                <div className='w-9 rounded-full'>
                  <img
                    alt='NutriAssistImg'
                    src={user.picture || '/images/nutri_assist_profile.png'}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className='mt-2 w-full flex items-center justify-center px-3 py-1.5 rounded-md text-zinc-500 hover:bg-zinc-600 hover:text-primary-white cursor-pointer ease-in-out duration-300'
            data-tooltip-id='logout-tooltip'
            data-tooltip-content='Logout'
            data-tooltip-place='right'
          >
            {!isCollapsed ? (
              <span className='hidden 13Inch:flex justify-center items-center 13Inch:space-x-3'>
                <LuDoorOpen className='size-6' />
                <p>Logout</p>
              </span>
            ) : (
              <LuDoorOpen className='size-6' />
            )}
            <span className='13Inch:hidden text-gray-500 hover:bg-zinc-600 hover:mx-2.5 hover:text-primary-white cursor-pointer ease-in-out duration-300'>
              <LuDoorOpen className='size-7' />
            </span>

            <Tooltip
              id='logout-tooltip'
              className={`font-medium !bg-primary-dark-light !text-primary-white !px-2 !py-1 ${
                isCollapsed ? '' : 'hidden'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar