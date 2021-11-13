import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useRecoilValue, useRecoilState } from 'recoil'
import { AvailableDatesState, ActiveDateIndexState, ActiveDateState, CurrentDataState } from '../data/globalDataState.js'
import { ChartSchoolsState, ChartSeriesState, ShowAdvancedState } from '../data/globalChartState.js'

import { makeStyles } from '@material-ui/core/styles'
import {
  Box, Grid, Typography, Tooltip as MuiTooltip, IconButton, Collapse, Select,
  List, ListItem, ListItemText, ListItemIcon, FormControl, InputLabel, MenuItem
} from '@material-ui/core'

import { Settings as SettingsIcon, KeyboardArrowRight } from '@material-ui/icons'
import { grey } from '@material-ui/core/colors'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

import ChartDataNavBar from './ChartDataNavBar.jsx'

const useStyles = makeStyles((theme) => ({
  notesListStyle: {
    textAlign: 'left'
  }
}))

export default function BarChartTab (props) {
  const { stacked } = props
  const { notesListStyle } = useStyles()

  // Subscribe to changes in important global state
  const [showAdvanced, setShowAdvanced] = useRecoilState(ShowAdvancedState)
  const chartSeries = useRecoilValue(ChartSeriesState)
  const chartSchools = useRecoilValue(ChartSchoolsState)
  const activeDate = useRecoilValue(ActiveDateState)
  const currentData = useRecoilValue(CurrentDataState)

  // Manage global active date state
  const availableDates = useRecoilValue(AvailableDatesState)
  const [activeDateIndex, setActiveDateIndex] = useRecoilState(ActiveDateIndexState)
  const [activeDateValue, setActiveDateValue] = useState(availableDates[activeDateIndex].lastUpdated)
  const handleDateChange = (event) => {
    const index = availableDates.findIndex((curDate) => (curDate.lastUpdated === event.target.value))
    if (index >= 0) {
      setActiveDateIndex(index)
      setActiveDateValue(availableDates[index].lastUpdated)
    }
  }

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
        if (match) { newItem[match.key] = currentData.data[key][series.key] }
      }
      dataArray.push(newItem)
    })
  } else {
    for (const key in currentData.data) {
      const match = enabledSchools.find((series) => (key === series.key))
      if (match) {
        dataArray.push({
          name: match.label,
          ...currentData.data[key]
        })
      }
    }
  }

  return (
    <Grid container spacing={2} align="center">
      <Grid item xs={10}>
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
      <Grid item xs={2}>
        <MuiTooltip title="Show Advanced Options">
          <IconButton
            onClick={(e) => { setShowAdvanced(!showAdvanced) }}
            aria-expanded={showAdvanced}
            aria-label="Show Advanced Options"
          >
            <SettingsIcon />
          </IconButton>
        </MuiTooltip>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
          <ChartDataNavBar />
        </Collapse>
      </Grid>
      {activeDate &&
        <React.Fragment>
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
                  <YAxis />
                  <Tooltip />
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
        </React.Fragment>}
    </Grid>
  )
}

BarChartTab.propTypes = {
  stacked: PropTypes.bool
}

BarChartTab.defaultProps = {
  stacked: false
}
