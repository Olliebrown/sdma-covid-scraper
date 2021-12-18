import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useRecoilValue, useRecoilState } from 'recoil'
import { ValidDatesState, ActiveDateIndexState, ActiveDateState } from '../data/globalDataState.js'
import { ShowAdvancedState } from '../data/globalChartState.js'

import {
  Grid, Tooltip, IconButton, Collapse, Select,
  FormControl, InputLabel, MenuItem
} from '@material-ui/core'

import { Settings as SettingsIcon } from '@material-ui/icons'

import ChartDataNavBar from './ChartDataNavBar.jsx'
import BarChartComponent from './BarChartComponent.jsx'

export default function BarChartTab (props) {
  const { stacked } = props

  // Subscribe to changes in important global state
  const [showAdvanced, setShowAdvanced] = useRecoilState(ShowAdvancedState)
  const activeDate = useRecoilValue(ActiveDateState)

  // Manage global active date state
  const availableDates = useRecoilValue(ValidDatesState)
  const [activeDateIndex, setActiveDateIndex] = useRecoilState(ActiveDateIndexState)
  const [activeDateValue, setActiveDateValue] = useState(availableDates[activeDateIndex].lastUpdated)
  const handleDateChange = (event) => {
    const index = availableDates.findIndex((curDate) => (curDate.lastUpdated === event.target.value))
    if (index >= 0) {
      setActiveDateIndex(index)
      setActiveDateValue(availableDates[index].lastUpdated)
    }
  }

  return (
    <Grid container spacing={2} align="center">
      <Grid item xs={11}>
        <FormControl fullWidth>
          <InputLabel id="dataDateSelectLabel">{'COVID Data Date'}</InputLabel>
          <Select
            labelId="dataDateSelectLabel"
            id="dataDateSelect"
            value={activeDateValue}
            onChange={handleDateChange}
          >
            {availableDates.map((dataDate) => (
              <MenuItem key={dataDate.lastUpdated} value={dataDate.lastUpdated}>{dataDate.lastUpdatedStr}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item container xs={1} direction="column" display="flex" justifyContent="flex-end">
        <Tooltip title="Show Advanced Options">
          <IconButton
            onClick={(e) => { setShowAdvanced(!showAdvanced) }}
            aria-expanded={showAdvanced}
            aria-label="Show Advanced Options"
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
          <ChartDataNavBar />
        </Collapse>
      </Grid>
      {activeDate && <BarChartComponent stacked={stacked} />}
    </Grid>
  )
}

BarChartTab.propTypes = {
  stacked: PropTypes.bool
}

BarChartTab.defaultProps = {
  stacked: false
}
