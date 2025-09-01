import React from 'react'
import SasquatchStrCampaign from './SasquatchStrCampaign'
import useExternalConnectorStore from '@/store/useExternalConnectorStore'
import ExternalConnectors from '../Connectors/ExternalConnectors'

const DisplayCampaign = ({ externalConnector }) => {
  const { name } = externalConnector

  let campaignToLoad

  switch (name) {
    case 'HighLevel':
      campaignToLoad = <SasquatchStrCampaign />
      break
    default:
      campaignToLoad = null
  }

  return campaignToLoad
}

const Campaign = () => {
  const { externalConnector } = useExternalConnectorStore()

  return (
    <>
      {externalConnector ? (
        <DisplayCampaign externalConnector={externalConnector} />
      ) : (
        <ExternalConnectors />
      )}
      {/* <SasquatchStrCampaign /> */}
    </>
  )
  // return {externalConnector && <DisplayCampaign externalConnector={externalConnector}  />}
}

export default Campaign
