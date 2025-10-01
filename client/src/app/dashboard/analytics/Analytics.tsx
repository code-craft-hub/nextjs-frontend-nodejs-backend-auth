
import React from 'react'
import { AnalyticsCard } from './components/AnalyticsCard'
import { UsageTrendDashboard } from './components/line-bar-chart'
import { AnalyticsBarChart } from './components/AnalyticsBarChart'

export const Analytics = () => {
  return (
    <div className='space-y-8'>
      <AnalyticsCard />
      <UsageTrendDashboard /> 
      <AnalyticsBarChart />
    </div>
  )
}

