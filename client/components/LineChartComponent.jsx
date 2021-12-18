import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { DateTime } from 'luxon'

import { useRecoilValue } from 'recoil'
import { CurrentRangeDataState, NormalizeTimesState } from '../data/globalRangeDataState.js'
import { ChartSchoolsState, ActiveSingleSeriesState } from '../data/globalChartState.js'

import {
  Box, Grid, TextField, InputAdornment, Checkbox, FormControl,
  FormControlLabel, InputLabel, Select, MenuItem
} from '@material-ui/core'

import { grey } from '@material-ui/core/colors'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

function formatTimestamp (timestamp) {
  return DateTime.fromMillis(timestamp).toFormat('LLL dd, yyyy')
}

export default function LineChartComponent (props) {
  const { startDate, endDate } = props

  // Local state
  const [xAxisDataType, setXAxisDataType] = useState('count')
  const [yAxisAuto, setYAxisAuto] = useState(true)
  const [yAxisMax, setYAxisMax] = useState(100)
  const handleYAxisMaxChange = (event) => {
    setYAxisMax(parseInt(event.target.value))
  }

  // Global state
  const normalizeTimes = useRecoilValue(NormalizeTimesState)
  const chartSchools = useRecoilValue(ChartSchoolsState)
  const currentRangeData = useRecoilValue(CurrentRangeDataState)
  const activeSeries = useRecoilValue(ActiveSingleSeriesState)
  const enabledSchools = chartSchools.filter((school) => (school.enabled))

  // Restructure the data
  const dataArray = []
  if (Array.isArray(currentRangeData)) {
    currentRangeData.forEach((currentData) => {
      const luxonDate = DateTime.fromMillis(parseInt(currentData.data.lastUpdated))
      const clampedDate = luxonDate.minus({ hours: 12 }).startOf('day').plus({ hours: 12 })
      if (currentData._id) {
        console.log(currentData.data.lastUpdatedStr, '->', luxonDate.toISO())
      }
      const newItem = {
        date: (normalizeTimes ?
          clampedDate.startOf('day').plus({ hours: 12 }).valueOf() :
          parseInt(currentData.data.lastUpdated))
      }

      for (const key in currentData.data) {
        const match = enabledSchools.find((series) => (key === series.key))
        if (match) {
          if (xAxisDataType === 'perCapita') {
            if (currentData.counts[key] === Infinity || currentData.counts[key] === 0) {
              newItem[key] = 0
            } else {
              newItem[key] = (currentData.data[key][activeSeries] / currentData.counts[key]) * 100
            }
          } else {
            newItem[key] = currentData.data[key][activeSeries]
          }
        }
      }
      dataArray.push(newItem)
    })
  }

  return (
    <React.Fragment>
      <Grid item xs={4}>
        <TextField
          fullWidth
          label="Y-Axis Max"
          value={yAxisMax}
          onChange={handleYAxisMaxChange}
          variant="outlined"
          type="number"
          disabled={yAxisAuto}
          size="small"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={yAxisAuto}
                      onChange={(e) => { setYAxisAuto(e.target.checked) }}
                      color="default"
                    />
                  }
                  label="Auto"
                />
              </InputAdornment>
            )
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth size="small">
          <InputLabel id="xAxis-dataType-label">{'Y-Axis Units'}</InputLabel>
          <Select
            labelId="xAxis-dataType-label"
            id="xAxis-dataType"
            value={xAxisDataType}
            onChange={(e) => { setXAxisDataType(e.target.value) }}
          >
            <MenuItem value="count">{'Raw Count'}</MenuItem>
            <MenuItem value="perCapita">{'Per Capita (%)'}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Box borderColor={grey[400]} border={1} borderTop={0} borderLeft={0} borderRight={0} paddingBottom={3} marginBottom={3}>
          <ResponsiveContainer height={600}>
            <LineChart
              width={500}
              height={600}
              data={dataArray}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='date'
                type='number'
                angle={-20}
                dy={20}
                height={80}
                interval={0}
                tickFormatter={formatTimestamp}
                domain={[startDate.startOf('day').valueOf(), endDate.endOf('day').valueOf()]}
              />
              <YAxis domain={[0, (yAxisAuto ? 'auto' : yAxisMax)]} />
              <Tooltip
                formatter={(value) => (
                  xAxisDataType === 'perCapita' ? value.toFixed(2) : value.toString()
                )}
                labelFormatter={formatTimestamp}
              />
              <Legend />
              {enabledSchools.map((series, i) => (
                <Line type="monotone" key={series.key} dataKey={series.key} name={series.label} stroke={series.color} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Grid>
    </React.Fragment>
  )
}

LineChartComponent.propTypes = {
  startDate: PropTypes.objectOf(DateTime).isRequired,
  endDate: PropTypes.objectOf(DateTime).isRequired
}
