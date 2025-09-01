import React from 'react'
import Link from 'next/link'
import { MdPeopleAlt, MdRecordVoiceOver } from 'react-icons/md'
import { FaClinicMedical } from 'react-icons/fa'

const MobileMenu = ({ setMobileMenu }) => {
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
      name: 'Organization',
      href: '/organization',
      icon: <FaClinicMedical className='text-2xl' />,
    },
  ]

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 sm:hidden flex justify-center items-start pt-14 z-10'>
      <div className='h-auto w-full mx-8 bg-white rounded-xl py-2 px-4 overflow-y-auto'>
        <ul>
          {links.map((link, index) => {
            let hideOrg = link.name == 'Organization' ? true : false
            return (
              <li key={index} className='my-4'>
                <Link
                  href={link.href}
                  className={hideOrg ? 'hidden' : 'flex items-center space-x-2'}
                  onClick={() => setMobileMenu(false)}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default MobileMenu
