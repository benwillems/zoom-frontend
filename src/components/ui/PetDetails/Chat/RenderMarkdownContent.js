import React from 'react'
import ReactMarkdown from 'react-markdown'

const RenderMarkdownContent = ({ markdownContent }) => {
  const components = {
    // Customize link rendering
    a: ({ node, ...props }) => (
      <a
        href={props.href}
        className='text-blue-600 font-medium hover:underline'
        target='_blank'
        rel='noopener noreferrer'
      >
        {props.children}
      </a>
    ),
  }

  return (
    <ReactMarkdown components={components}>{markdownContent}</ReactMarkdown>
  )
}

export default RenderMarkdownContent
