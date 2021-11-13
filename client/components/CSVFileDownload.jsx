import React from 'react'

import { useRecoilValue } from 'recoil'
import { CurrentDataState } from '../data/globalDataState.js'

import { Button } from '@material-ui/core'

export default function CSVFileDownload (props) {
  // Subscribe to changes in global state
  const currentData = useRecoilValue(CurrentDataState)

  // Build file data for downloading
  const dataURL = `data:text/plain;charset=utf-8,${encodeURIComponent(currentData.rawCsv)}`
  const filename = currentData.data.lastUpdatedStr.replace(/[\W\s]/g, '_') + '.csv'

  return (
    <Button href={dataURL} download={filename} {...props}>{'Download Raw CSV File'}</Button>
  )
}
