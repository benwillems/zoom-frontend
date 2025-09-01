import React from 'react'
import { ColorRing } from 'react-loader-spinner'

const CircleSpinner = ({ loading, height, width }) => {
  return (
    <div className='flex justify-center items-center mx-0 select-none'>
      {loading && (
        <ColorRing
          visible={true}
          height={height || '40'}
          width={width || '40'}
          ariaLabel='blocks-loading'
          wrapperStyle={{}}
          wrapperClass='blocks-wrapper'
          colors={[
            '#60a5fa',
            '#60a5fa',
            '#60a5fa',
            '#60a5fa',
            '#60a5fa',
            '#60a5fa',
          ]}
        />
      )}
    </div>
  )
}

export default CircleSpinner
