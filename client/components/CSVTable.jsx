import React, { useState } from 'react'

import { useRecoilValue, useRecoilState } from 'recoil'
import { AvailableDatesState, ActiveDateIndexState, ParsedDataState } from '../data/globalDataState.js'

import {
  Grid, FormControl, InputLabel, Select, MenuItem, Paper,
  Table, TableContainer, TableBody, TableRow, TableCell
} from '@material-ui/core'

import CSVFileDownload from './CSVFileDownload.jsx'

export default function CSVTable (props) {
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

  // Subscribe to changes in the global data
  const parsedData = useRecoilValue(ParsedDataState)
  let colCount = 0
  parsedData.forEach((row) => { if (row.length > colCount) colCount = row.length })

  return (
    <Grid container spacing={2} align="center">
      <Grid item xs={12}>
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
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              {parsedData.map((row, i) => (
                row.length > 0 &&
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j} colSpan={j === row.length - 1 ? colCount - j : 1}>
                      {cell || ' '}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12}>
        <CSVFileDownload fullWidth variant="contained" color="primary" />
      </Grid>
    </Grid>
  )
}
