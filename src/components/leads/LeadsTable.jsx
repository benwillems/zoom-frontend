import React, { useState } from 'react'
import {
  FaPhone,
  FaBookOpen,
  FaCalendarAlt,
  FaChevronRight,
} from 'react-icons/fa'
import { IoPersonSharp } from 'react-icons/io5'
import {
  MdEventAvailable,
  MdAccessTime,
  MdClear,
  MdCampaign,
} from 'react-icons/md'
import { FaArrowUpLong, FaArrowDownLong } from 'react-icons/fa6'
import { Tooltip } from 'react-tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import ActionButton from '../common/ActionButton'
import { BsArrowsCollapse } from 'react-icons/bs'
import { CiSearch } from 'react-icons/ci'

const ITEMS_PER_PAGE = 12

// Column width classes with consistent constraints
const columnClasses = {
  expand: 'w-16',
  name: 'w-auto ',
  phone: 'w-auto',
  campaign: 'w-auto',
  callReceived: 'w-auto',
  duration: 'w-auto',
  booked: 'w-auto',
  callback: 'w-auto',
  transcript: 'w-auto',
}

// Truncated cell component with tooltip
const TruncatedCell = ({ content, className }) => (
  <td className={`${className} overflow-hidden`}>
    <div className='truncate' title={content}>
      {content}
    </div>
  </td>
)

const ExpandButton = ({ isExpanded, onClick }) => (
  <motion.button
    onClick={onClick}
    className='btn btn-ghost btn-sm btn-square'
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <motion.div
      initial={false}
      animate={{ rotate: isExpanded ? 90 : 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      <FaChevronRight className='text-gray-600' />
    </motion.div>
  </motion.button>
)

const SortableHeader = ({
  icon,
  label,
  sortKey,
  expandedRows,
  sortConfig,
  handleSort,
  centered = false,
  className,
}) => {
  const baseStyles = 'font-bold relative transition-all duration-200'
  const hoverStyles =
    expandedRows.size > 0 ? 'cursor-not-allowed' : 'cursor-pointer'

  return (
    <th
      data-tooltip-id='sort-tooltip'
      data-tooltip-content="Unable to sort due to opened rows, click 'Collapse All' to enable sorting."
      data-tooltip-place='bottom'
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div
        className={`flex items-center text-black text-sm ${
          centered ? 'justify-center' : ''
        }`}
      >
        {icon}
        <span>{label}</span>
        {expandedRows.size > 0 ? (
          <FaArrowDownLong className='size-4 text-gray-500 ml-1' />
        ) : sortConfig.key === sortKey ? (
          sortConfig.direction === 'asc' ? (
            <FaArrowUpLong className='size-4 ml-1' />
          ) : (
            <FaArrowDownLong className='size-4 ml-1' />
          )
        ) : (
          <FaArrowDownLong className='size-4 text-gray-500 ml-1' />
        )}
      </div>
    </th>
  )
}

const LeadsTable = ({
  leads,
  onTranscriptView,
  searchQuery,
  setSearchQuery,
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [showCallbacks, setShowCallbacks] = useState(new Set())
  const [sortConfig, setSortConfig] = useState({
    key: 'calledDate',
    direction: 'desc',
  })

  const handleSort = key => {
    if (expandedRows.size > 0) {
      return
    }

    setSortConfig(current => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const toggleRow = phoneNumber => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(phoneNumber)) {
      newExpandedRows.delete(phoneNumber)
    } else {
      newExpandedRows.add(phoneNumber)
    }
    setExpandedRows(newExpandedRows)
  }

  const toggleCallback = phoneNumber => {
    const newCallbacks = new Set(showCallbacks)
    if (newCallbacks.has(phoneNumber)) {
      newCallbacks.delete(phoneNumber)
    } else {
      newCallbacks.add(phoneNumber)
    }
    setShowCallbacks(newCallbacks)
  }

  // Enhanced search and group function
  const sortedAndGroupedLeads = React.useMemo(() => {
    // First filter leads based on search query
    const filteredLeads = leads.filter(lead => {
      if (!searchQuery) return true

      const searchLower = searchQuery.toLowerCase().trim()
      const cleanSearchQuery = searchQuery.replace(/[\s()-]/g, '')
      const cleanPhoneNumber = (lead.phone || '').replace(/[\s()-]/g, '')
      const cleanCampaignName = (lead.campaign?.name || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')

      return (
        lead.name?.toLowerCase().includes(searchLower) ||
        cleanPhoneNumber.includes(cleanSearchQuery) ||
        cleanCampaignName.includes(searchLower)
      )
    })

    // Group filtered leads by phone number
    const grouped = filteredLeads.reduce((acc, lead) => {
      if (!acc[lead.phone]) {
        acc[lead.phone] = []
      }
      acc[lead.phone].push(lead)
      return acc
    }, {})

    // Convert to array of [phone, leads] pairs
    const groupedArray = Object.entries(grouped)

    // Sort parent rows based on their main (most recent) lead
    const sortedGroups = groupedArray.sort((a, b) => {
      const aLead = a[1][0]
      const bLead = b[1][0]

      switch (sortConfig.key) {
        case 'calledDate':
          const dateA = new Date(aLead.calledDate)
          const dateB = new Date(bLead.calledDate)
          return sortConfig.direction === 'desc' ? dateB - dateA : dateA - dateB

        case 'duration':
          return sortConfig.direction === 'asc'
            ? aLead.duration - bLead.duration
            : bLead.duration - aLead.duration

        case 'bookingDate':
          // Use a fallback date (like the epoch) if bookingDate is null so that nulls sort consistently
          const bookingA = aLead.bookingDate
            ? new Date(aLead.bookingDate)
            : new Date(0)
          const bookingB = bLead.bookingDate
            ? new Date(bLead.bookingDate)
            : new Date(0)
          return sortConfig.direction === 'asc'
            ? bookingA - bookingB
            : bookingB - bookingA

        case 'campaign':
          const campaignA = (aLead.campaign?.name || '').toLowerCase()
          const campaignB = (bLead.campaign?.name || '').toLowerCase()
          return sortConfig.direction === 'asc'
            ? campaignA.localeCompare(campaignB)
            : campaignB.localeCompare(campaignA)

        default:
          return 0
      }
    })

    // Sort leads within each group by date (newest first)
    return sortedGroups.map(([phone, leads]) => [
      phone,
      leads.sort((a, b) => new Date(b.calledDate) - new Date(a.calledDate)),
    ])
  }, [leads, searchQuery, sortConfig])

  const clearFilters = () => {
    setSearchQuery('')
    setSortConfig({
      key: 'calledDate',
      direction: 'desc',
    })
  }

  const collapseAllRows = () => {
    setExpandedRows(new Set())
    clearFilters()
  }

  const formatDateTime = dateString => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDuration = duration => {
    if (!duration) return 'N/A'
    return `${duration.toFixed(1)}m`
  }

  // Calculate pagination
  const totalPages = Math.ceil(sortedAndGroupedLeads.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentLeads = sortedAndGroupedLeads.slice(startIndex, endIndex)

  return (
    <div className='w-full bg-white rounded-lg shadow mb-6'>
      {/* Card Header */}
      <div className='px-6 pt-4 pb-2'>
        <div className='flex justify-between items-center'>
          <div className='space-y-1'>
            <h2 className='text-xl font-semibold text-gray-800'>Leads Table</h2>
            <p className='text-sm text-gray-600'>View and manage all leads</p>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className='p-6'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center w-96 bg-base-200 rounded-md border py-1.5 px-2'>
              <CiSearch className='text-lg md:text-xl text-black stroke-1' />
              <input
                type='text'
                placeholder='Search by name, phone and campaign'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='text-sm placeholder:text-black placeholder:font-medium bg-base-200 font-medium outline-none w-full pl-2'
              />
            </div>
            <ActionButton
              onClick={clearFilters}
              buttonText='Reset Filter'
              Icon={MdClear}
              disabled={
                sortConfig?.key === 'calledDate' &&
                sortConfig.direction === 'desc'
              }
            />
            <ActionButton
              onClick={collapseAllRows}
              buttonText='Collapse All'
              Icon={BsArrowsCollapse}
              iconClases='size-4'
              disabled={expandedRows.size === 0}
            />
          </div>
          <div className='join'>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className='join-item btn btn-sm'
            >
              «
            </button>
            <button
              className='join-item btn btn-sm'
              onClick={() => setCurrentPage(1)}
            >
              Page {currentPage} of {totalPages}
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className='join-item btn btn-sm'
            >
              »
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='border rounded-lg overflow-hidden'>
          <div className='min-h-[725px]'>
            <table className='table w-full table-fixed'>
              <thead className='bg-blue-300 sticky top-0 [&_tr:hover]:bg-blue-300 select-none'>
                <tr>
                  <th className={columnClasses.expand}>
                    <div className='flex justify-center items-center font-medium text-black text-sm'>
                      ({sortedAndGroupedLeads?.length})
                    </div>
                  </th>
                  <th className={columnClasses.name}>
                    <div className='flex items-center text-black text-sm'>
                      <IoPersonSharp className='mr-1.5' />
                      <span>Name</span>
                    </div>
                  </th>
                  <th className={columnClasses.phone}>
                    <div className='flex items-center text-black text-sm'>
                      <FaPhone className='size-3 mr-1.5 rotate-90' />
                      <span>Phone</span>
                    </div>
                  </th>
                  <SortableHeader
                    icon={<MdCampaign className='mr-1.5' />}
                    label='Campaign'
                    sortKey='campaign'
                    expandedRows={expandedRows}
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                    className={columnClasses.campaign}
                  />
                  <SortableHeader
                    icon={<FaCalendarAlt className='mr-1.5' />}
                    label='Call Received'
                    sortKey='calledDate'
                    expandedRows={expandedRows}
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                    className={columnClasses.callReceived}
                  />
                  <SortableHeader
                    icon={<MdAccessTime className='mr-1.5' />}
                    label='Duration'
                    sortKey='duration'
                    expandedRows={expandedRows}
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                    className={columnClasses.duration}
                  />
                  <SortableHeader
                    icon={<MdEventAvailable className='size-4 mr-1.5' />}
                    label='Booked'
                    sortKey='bookingDate'
                    expandedRows={expandedRows}
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                    centered={true}
                    className={columnClasses.booked}
                  />
                  <th className={columnClasses.callback}>
                    <div className='flex items-center justify-center text-black text-sm'>
                      <span>Callback</span>
                    </div>
                  </th>
                  <th className={columnClasses.transcript}>
                    <div className='flex items-center justify-center text-black text-sm'>
                      <FaBookOpen className='size-4 mr-1.5' />
                      <span>Transcript</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className='flex-1'>
                {currentLeads?.length === 0 ? (
                  <tr className='h-full'>
                    <td colSpan={9} className='align-middle'>
                      <div className='flex flex-col items-center justify-center flex-1 min-h-[658px]'>
                        <p className='text-lg font-medium text-gray-500'>
                          No data available
                        </p>
                        <p className='text-sm text-gray-400'>
                          No leads match your search criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentLeads.map(([phone, leads], index) => {
                    const mainLead = leads[0]
                    const hasMultipleCalls = leads.length > 1

                    const bookingDateToShow = leads.reduce((acc, lead) => {
                      // If this call has a booking date:
                      if (lead.bookingDate) {
                        // If acc is null (i.e. no booking date found yet) or the current lead's booking date is later than the one we already have:
                        return !acc ||
                          new Date(lead.bookingDate) > new Date(acc)
                          ? lead.bookingDate
                          : acc
                      }
                      return acc
                    }, null)

                    return (
                      <React.Fragment key={phone}>
                        {/* Parent Row */}
                        <tr
                          className={`
                          ${
                            expandedRows.has(phone)
                              ? 'bg-blue-100 hover:bg-blue-200'
                              : index % 2 === 0
                              ? 'bg-base-100 hover:bg-blue-200'
                              : 'bg-base-200 hover:bg-blue-200'
                          }
                        `}
                        >
                          <td className={columnClasses.expand}>
                            {hasMultipleCalls ? (
                              <ExpandButton
                                isExpanded={expandedRows.has(phone)}
                                onClick={() => toggleRow(phone)}
                              />
                            ) : (
                              <div className='w-8' />
                            )}
                          </td>
                          <TruncatedCell
                            content={mainLead.name}
                            className={`${columnClasses.name} font-semibold whitespace-nowrap`}
                          />
                          <td className={columnClasses.phone}>
                            {mainLead.phone}
                          </td>
                          <TruncatedCell
                            content={mainLead?.campaign?.name}
                            className={`${columnClasses.campaign} whitespace-nowrap`}
                          />
                          {/* Empty cells for consistency */}
                          <td className={columnClasses.callReceived}>
                            {!hasMultipleCalls &&
                              formatDateTime(mainLead.calledDate)}
                          </td>
                          <td className={columnClasses.duration}>
                            {!hasMultipleCalls &&
                              formatDuration(mainLead.duration)}
                          </td>
                          <td className={`${columnClasses.booked} text-center`}>
                            <span
                              className={`px-3 py-1 rounded-full text-xs ${
                                bookingDateToShow
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {bookingDateToShow
                                ? formatDateTime(bookingDateToShow)
                                : 'No'}
                            </span>
                          </td>
                          <td
                            className={`${columnClasses.callback} text-center`}
                          >
                            <input
                              type='checkbox'
                              className='toggle toggle-primary'
                              checked={showCallbacks.has(phone)}
                              onChange={() => toggleCallback(phone)}
                            />
                          </td>
                          <td
                            className={`${columnClasses.transcript} text-center`}
                          >
                            {!hasMultipleCalls && (
                              <button
                                onClick={() => onTranscriptView(mainLead)}
                                className='btn btn-ghost btn-xs uppercase text-xs text-blue-700'
                              >
                                view
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Child Rows - ALL calls including the one from parent */}
                        <AnimatePresence>
                          {hasMultipleCalls &&
                            expandedRows.has(phone) &&
                            leads
                              .sort(
                                (a, b) =>
                                  new Date(b.calledDate) -
                                  new Date(a.calledDate)
                              )
                              .map(lead => (
                                <motion.tr
                                  key={lead.id + lead.callId}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: 'easeInOut',
                                  }}
                                  className='bg-blue-100 hover:bg-blue-200'
                                >
                                  <td className={columnClasses.expand}></td>
                                  <TruncatedCell
                                    content={lead.name}
                                    className={`${columnClasses.name} font-semibold`}
                                  />
                                  <td className={columnClasses.phone}>
                                    {lead.phone}
                                  </td>
                                  <TruncatedCell
                                    content={lead?.campaign?.name}
                                    className={columnClasses.campaign}
                                  />
                                  <td className={columnClasses.callReceived}>
                                    {formatDateTime(lead.calledDate)}
                                  </td>
                                  <td className={columnClasses.duration}>
                                    {formatDuration(lead.duration)}
                                  </td>
                                  <td
                                    className={`${columnClasses.booked} text-center`}
                                  >
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs ${
                                        lead.bookingDate !== null
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {lead.bookingDate !== null
                                        ? formatDateTime(lead.bookingDate)
                                        : 'No'}
                                    </span>
                                  </td>
                                  <td className={columnClasses.callback}></td>
                                  <td
                                    className={`${columnClasses.transcript} text-center`}
                                  >
                                    <button
                                      onClick={() => onTranscriptView(lead)}
                                      className='btn btn-ghost btn-xs uppercase text-xs text-blue-700'
                                    >
                                      view
                                    </button>
                                  </td>
                                </motion.tr>
                              ))}
                        </AnimatePresence>
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tooltips */}
      {expandedRows?.size > 0 && (
        <Tooltip id='sort-tooltip' place='bottom' variant='dark' />
      )}
      <Tooltip id='content-tooltip' place='top' variant='dark' />
    </div>
  )
}

export default LeadsTable
