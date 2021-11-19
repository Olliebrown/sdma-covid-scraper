import React, { useState } from 'react'

import { useRecoilState, useRecoilValue } from 'recoil'
import { StartDateState, EndDateState } from '../data/globalRangeDataState.js'
import { ChartSeriesState } from '../data/globalChartState.js'

import LuxonUtils from '@date-io/luxon'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'

import { Grid } from '@material-ui/core'

import DataEnableSelect from './DataEnableSelect.jsx'
import LineChartComponent from './LineChartComponent.jsx'

export default function LineChartTab (props) {
  // Subscribe to changes in important global state
  const chartSeries = useRecoilValue(ChartSeriesState)
  const [startDate, setStartDate] = useRecoilState(StartDateState)
  const [endDate, setEndDate] = useRecoilState(EndDateState)

  const [selectedSeries, setSelectedSeries] = useState('StudentCurrentPositive')

  return (
    <Grid container spacing={2} align="center">
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <Grid item xs={12} md={3}>
          <KeyboardDatePicker
            fullWidth
            format="MM/dd/yyyy"
            margin="normal"
            id="startDatePicker"
            label="Start Date"
            size="small"
            value={startDate}
            onChange={setStartDate}
            KeyboardButtonProps={{
              'aria-label': 'pick start date'
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KeyboardDatePicker
            fullWidth
            format="MM/dd/yyyy"
            margin="normal"
            id="endDatePicker"
            label="End Date"
            size="small"
            value={endDate}
            onChange={setEndDate}
            KeyboardButtonProps={{
              'aria-label': 'pick end date'
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DataEnableSelect
            name='dataSeries'
            labelText='Select Data Series'
            entries={chartSeries}
            value={selectedSeries}
            handleChange={(e) => { setSelectedSeries(e.target.value) }}
            size="small"
            single
          />
        </Grid>

      </MuiPickersUtilsProvider>
      {!startDate.invalid && !endDate.invalid &&
        <LineChartComponent startDate={startDate} endDate={endDate} activeSeries={selectedSeries} />}
    </Grid>
  )
}
