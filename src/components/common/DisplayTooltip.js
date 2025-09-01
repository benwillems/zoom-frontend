import React from 'react'
import { Tooltip } from 'react-tooltip'

const DisplayTooltip = ({
  id,
  children,
  place,
  effect,
  variant,
  multiline,
  className,
  message,
  customStyle,
  displayCondition = true,
}) => {
  return (
    <>
      <div data-tooltip-id={id} className={className}>
        {children}
      </div>
      {displayCondition && (
        <Tooltip
          id={id}
          place={place}
          effect={effect}
          variant={variant}
          multiline={multiline}
          style={customStyle}
          content={message}
        />
      )}
    </>
  )
}

export default DisplayTooltip
