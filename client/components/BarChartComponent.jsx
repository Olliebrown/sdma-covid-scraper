import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useRecoilValue } from 'recoil'
import { CurrentDataState } from '../data/globalDataState.js'
import { ChartSchoolsState, ChartSeriesState } from '../data/globalChartState.js'

import { makeStyles } from '@material-ui/core/styles'
import {
  Box, Grid, Typography, List, ListItem, ListItemIcon, ListItemText,
  TextField, InputAdornment, Checkbox, FormControl, FormControlLabel,
  InputLabel, Select, MenuItem
} from '@material-ui/core'

import { KeyboardArrowRight } from '@material-ui/icons'
import { grey } from '@material-ui/core/colors'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const useStyles = makeStyles((theme) => ({
  notesListStyle: {
    textAlign: 'left'
  }
}))

export default function BarChartComponent (props) {
  const { stacked } = props
  const { notesListStyle } = useStyles()

  // Local state
  const [xAxisDataType, setXAxisDataType] = useState('count')
  const [yAxisAuto, setYAxisAuto] = useState(true)
  const [yAxisMax, setYAxisMax] = useState(100)
  const handleYAxisMaxChange = (event) => {
    setYAxisMax(parseInt(event.target.value))
  }

  // Global state
  const chartSeries = useRecoilValue(ChartSeriesState)
  const chartSchools = useRecoilValue(ChartSchoolsState)
  const currentData = useRecoilValue(CurrentDataState)

  // Make enabled lists
  const enabledSeries = chartSeries.filter((series) => (series.enabled))
  const enabledSchools = chartSchools.filter((school) => (school.enabled))

  // Restructure the data
  const dataArray = []
  if (stacked) {
    enabledSeries.forEach((series) => {
      const newItem = { name: series.label }
      for (const key in currentData.data) {
        const match = enabledSchools.find((school) => (key === school.key))
        if (match) {
          newItem[match.key] = currentData.data[key][series.key]
          if (xAxisDataType === 'per100') {
            if (currentData.counts[key] === Infinity || currentData.counts[key] === 0) {
              newItem[match.key] = 0
            } else {
              newItem[match.key] = (newItem[match.key] / currentData.counts[key]) * 100
            }
          }
        }
      }
      dataArray.push(newItem)
    })
  } else {
    for (const key in currentData.data) {
      const match = enabledSchools.find((series) => (key === series.key))
      if (match) {
        const newItem = { name: match.label, ...currentData.data[key] }
        if (xAxisDataType === 'per100') {
          for (const prop in newItem) {
            if (prop !== 'name' && typeof newItem[prop] === 'number') {
              if (currentData.counts[key] === Infinity || currentData.counts[key] === 0) {
                newItem[prop] = 0
              } else {
                newItem[prop] = (newItem[prop] / currentData.counts[key]) * 100
              }
            }
          }
        }
        dataArray.push(newItem)
      }
    }
  }

  console.log(dataArray)

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
            <MenuItem value="perCapita">{'Per Capita'}</MenuItem>
            <MenuItem value="per100">{'Per 100 (%)'}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Box borderColor={grey[400]} border={1} borderTop={0} borderLeft={0} borderRight={0} paddingBottom={3} marginBottom={3}>
          <ResponsiveContainer height={600}>
            <BarChart
              width={500}
              height={600}
              data={dataArray}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' angle={stacked ? 0 : -20} dy={stacked ? 0 : 20} height={stacked ? 40 : 80} />
              <YAxis domain={[0, (yAxisAuto ? 'auto' : yAxisMax)]} />
              <Tooltip formatter={(value) => (xAxisDataType === 'perCapita' ? value.toString() : value.toFixed(2))} />
              <Legend />
              {stacked ?
                enabledSchools.map((school, i) => (
                  <Bar key={school.key} dataKey={school.key} name={school.label} fill={school.color} stackId='a' />
                )) :
                enabledSeries.map((series, i) => (
                  <Bar key={series.key} dataKey={series.key} name={series.label} fill={series.color} />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Grid>
      <Grid item xs={12} className={notesListStyle}>
        <Typography variant="h5" component="h3">
          {'Official Data Notes:'}
        </Typography>
        <List>
          {currentData.data.notes.map((note, i) => (
            <ListItem key={i}>
              <ListItemIcon><KeyboardArrowRight /></ListItemIcon>
              <ListItemText>{note}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Grid>
    </React.Fragment>
  )
}

BarChartComponent.propTypes = {
  stacked: PropTypes.bool
}

BarChartComponent.defaultProps = {
  stacked: false
}
