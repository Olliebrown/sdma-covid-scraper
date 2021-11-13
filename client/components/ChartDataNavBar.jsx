import React from 'react'

import { useRecoilState } from 'recoil'
import { ChartSeriesState, ChartSchoolsState } from '../data/globalChartState.js'

import { makeStyles } from '@material-ui/core/styles'

import { Grid } from '@material-ui/core'
import { DataEnableSelect } from './DataEnableSelect.jsx'

const useStyles = makeStyles((theme) => ({
  upperGridStyle: {
    alignItems: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  lowerGridStyle: {
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(2)
  },
  justified: {
    justifyContent: 'center'
  },
  flipped: {
    transform: 'scaleY(-1);'
  }
}))

function updateDataArray (originalData, event) {
  // Copy data and set all to disabled
  const newData = [...originalData]
  for (let i = 0; i < newData.length; i++) {
    newData[i] = { ...newData[i], enabled: false }
  }

  // Set the 'enabled' ones to true
  event.target.value.forEach((enabledItem) => {
    const i = newData.findIndex((item) => (item.key === enabledItem))
    if (i >= 0) { newData[i] = { ...newData[i], enabled: true } }
  })

  // Return back the adjusted array
  return newData
}

export default function ChartDataNavBar (props) {
  const classes = useStyles()

  // Subscribe to changes in chart state
  const [chartSchools, setChartSchools] = useRecoilState(ChartSchoolsState)
  const handleSchoolsChange = (event) => {
    // Update schools global state
    const newSchools = updateDataArray(chartSchools, event)
    setChartSchools(newSchools)
  }

  // Manage global chart series state
  const [chartSeries, setChartSeries] = useRecoilState(ChartSeriesState)
  const handleSeriesChange = (event) => {
    // Update schools global state
    const newSeries = updateDataArray(chartSeries, event)
    setChartSeries(newSeries)
  }

  return (
    <Grid container spacing={3} className={classes.lowerGridStyle}>
      <Grid item xs={12} md={6}>
        <DataEnableSelect
          name='dataSeries'
          labelText='Select Data Series'
          entries={chartSeries}
          handleChange={handleSeriesChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DataEnableSelect
          name='dataSchools'
          labelText='Select Schools'
          entries={chartSchools}
          handleChange={handleSchoolsChange}
        />
      </Grid>
    </Grid>
  )
}
