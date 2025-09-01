import React from 'react'
import { Card } from '../ui/card/Card'
import { CardContent } from '../ui/card/CardContent'

const TranscriptViewer = ({ transcripts }) => {
  return (
    <Card className='max-w-2xl mx-auto bg-gray-50'>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          {transcripts?.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.user === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.user === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white shadow-sm border border-gray-200'
                }`}
              >
                <div className='flex items-center space-x-2 mb-1'>
                  <span className='text-xs font-medium'>
                    {message.user === 'user' ? '👤 You' : '🤖 Assistant'}
                  </span>
                  <span
                    className={`text-xs ${
                      message.user === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-400'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    message.user === 'user' ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TranscriptViewer
