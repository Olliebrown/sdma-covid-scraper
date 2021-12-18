import React from 'react'
import PropTypes from 'prop-types'

import { useRecoilState, useRecoilValue } from 'recoil'
import { ChartSeriesState, SingleSeriesState, ActiveSingleSeriesState, ChartSchoolsState } from '../data/globalChartState.js'

import { makeStyles } from '@material-ui/core/styles'

import { Grid } from '@material-ui/core'
import DataEnableSelect from './DataEnableSelect.jsx'

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
  if (Array.isArray(event.target.value)) {
    event.target.value.forEach((enabledItem) => {
      const i = newData.findIndex((item) => (item.key === enabledItem))
      if (i >= 0) { newData[i] = { ...newData[i], enabled: true } }
    })
  } else {
    console.log(event.target.value)
    const i = newData.findIndex((item) => (item.key === event.target.value))
    if (i >= 0) { newData[i] = { ...newData[i], enabled: true } }
  }

  // Return back the adjusted array
  return newData
}

export default function ChartDataNavBar (props) {
  const { singleSeries } = props
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
    // Update series global state
    const newSeries = updateDataArray(chartSeries, event)
    setChartSeries(newSeries)
  }

  // Manage global single series state
  const activeSingleSeries = useRecoilValue(ActiveSingleSeriesState)
  const [singleSeriesData, setSingleSeries] = useRecoilState(SingleSeriesState)
  const handleSingleSeriesChange = (event) => {
    // Update single series global state
    const newSeries = updateDataArray(singleSeriesData, event)
    setSingleSeries(newSeries)
  }

  return (
    <Grid container spacing={3} className={classes.lowerGridStyle}>
      <Grid item xs={12} md={6}>
        {singleSeries &&
          <DataEnableSelect
            name='dataSeries'
            labelText='Select Data Series'
            entries={singleSeriesData}
            handleChange={handleSingleSeriesChange}
            value={activeSingleSeries}
            single
          />}
        {!singleSeries &&
          <DataEnableSelect
            name='dataSeries'
            labelText='Select Data Series'
            entries={chartSeries}
            handleChange={handleSeriesChange}
          />}
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

ChartDataNavBar.propTypes = {
  singleSeries: PropTypes.bool
}

ChartDataNavBar.defaultProps = {
  singleSeries: false
}
