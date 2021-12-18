import React, { useState } from 'react'

import { useRecoilValue, useRecoilState } from 'recoil'
import { AvailableDatesState, ActiveDateIndexState, CurrentDataInvalidState, ParsedDataState } from '../data/globalDataState.js'

import { makeStyles } from '@material-ui/core/styles'
import {
  Grid, FormControl, InputLabel, Select, MenuItem, Paper,
  Table, TableContainer, TableBody, TableRow, TableCell, Typography
} from '@material-ui/core'

import CSVFileDownload from './CSVFileDownload.jsx'

const useStyles = makeStyles((theme) => ({
  warningHeading: {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.error.contrastText,
    marginTop: theme.spacing(2)
  },
  warningBody: {
    borderBottom: '1px solid grey',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(2)
  }
}))

export default function CSVTable (props) {
  // Deconstruct style classnames
  const { warningHeading, warningBody } = useStyles()

  // Manage global active date state
  const availableDates = useRecoilValue(AvailableDatesState)
  const currentDataInvalid = useRecoilValue(CurrentDataInvalidState)
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
      {currentDataInvalid &&
        <Grid item xs={12}>
          <Typography className={warningHeading} variant='h5' component='h2'>
            {'WARNING:'}
          </Typography>
          <Typography className={warningBody} variant='body1'>
            {'This data is flagged as INVALID (is was likely corrected by an upload with a duplicate date-time)'}
          </Typography>
        </Grid>}
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
