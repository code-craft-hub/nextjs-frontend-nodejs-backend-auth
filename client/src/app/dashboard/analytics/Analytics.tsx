
import React from 'react'
import { AnalyticsCard } from './components/AnalyticsCard'
import { UsageTrendDashboard } from './components/line-bar-chart'

export const Analytics = () => {
  return (
    <div className='space-y-8'>
      <AnalyticsCard />
      <UsageTrendDashboard />
    </div>
  )
}

