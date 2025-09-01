import React from 'react'
import { EXTERNAL_CONNECTORS } from './external-connector-constants.js'
import ExternalConnectorCard from './ExternalConnectorCard'

const ExternalConnectors = () => {
  return (
    <div className='flex flex-col space-y-6 mt-6'>
      <h2 className='text-xl font-medium text-gray-900'>
        Select your connector
      </h2>

      <div>
        {EXTERNAL_CONNECTORS.map(connector => (
          <ExternalConnectorCard key={connector.name} connector={connector} />
        ))}
      </div>
    </div>
  )
}

export default ExternalConnectors
