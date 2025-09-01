import React from 'react'
import dynamic from 'next/dynamic'

const ResponsivePieCanvas = dynamic(
  () => import('@nivo/pie').then(module => module.ResponsivePieCanvas),
  { ssr: false }
)

const PieChart = ({ data, title }) => {
  return (
    <div style={{ height: '350px', width: '500px' }}>
      <h3 className='text-lg font-semibold border-l-4 border-blue-500 text-left pl-4 mb-4'>
        {title}
      </h3>
      <ResponsivePieCanvas
        data={data}
        margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor='#333333'
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
      />
    </div>
  )
}

export default PieChart
