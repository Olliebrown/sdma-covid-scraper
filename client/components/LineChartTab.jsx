import React from 'react'

import { useRecoilState } from 'recoil'
import { StartDateState, EndDateState, NormalizeTimesState } from '../data/globalRangeDataState.js'

import CustomLuxonUtils from './CustomLuxonUtils.js'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'

import { Grid, FormControlLabel, Checkbox } from '@material-ui/core'

import LineChartComponent from './LineChartComponent.jsx'
import ChartDataNavBar from './ChartDataNavBar.jsx'

export default function LineChartTab (props) {
  // Subscribe to changes in important global state
  const [startDate, setStartDate] = useRecoilState(StartDateState)
  const [endDate, setEndDate] = useRecoilState(EndDateState)
  const [normalizeTimes, setNormalizeTimes] = useRecoilState(NormalizeTimesState)

  return (
    <Grid container spacing={2} align="center">
      <MuiPickersUtilsProvider utils={CustomLuxonUtils}>
        <Grid item xs={12} md={5}>
          <KeyboardDatePicker
            fullWidth
            disableToolbar
            variant="inline"
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
        <Grid item xs={10} md={5}>
          <KeyboardDatePicker
            fullWidth
            disableToolbar
            variant="inline"
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
        <Grid item container xs={2} direction="column" display="flex" justifyContent="flex-end">
          <FormControlLabel
            control={
              <Checkbox
                checked={normalizeTimes}
                onChange={(e) => { setNormalizeTimes(e.target.checked) }}
                color="default"
              />
            }
            label="Normalize Times"
          />
        </Grid>
        <Grid item xs={12}>
          <ChartDataNavBar singleSeries />
        </Grid>
      </MuiPickersUtilsProvider>
      {!startDate.invalid && !endDate.invalid &&
        <LineChartComponent startDate={startDate} endDate={endDate} normalizeTimes={normalizeTimes} />}
    </Grid>
  )
}
