import React from 'react'
import PropTypes from 'prop-types'

import { MenuItem, Select, FormControl, InputLabel } from '@material-ui/core'

import { SelectDataShape } from '../data/globalChartState.js'

export default function DataEnableSelect (props) {
  const { name, labelText, handleChange, entries, single, value } = props
  const handleChangeInternal = (event) => {
    if (handleChange) { handleChange(event) }
  }

  // Build value array
  const selectedValues = entries.filter((option) => (option.enabled)).map((option) => (option.key))

  return (
    <FormControl fullWidth>
      <InputLabel id={`${name}-dataSelectLabel`}>{labelText}</InputLabel>
      <Select
        id={`${name}-dataSelect`}
        labelId={`${name}-dataSelectLabel`}
        value={single ? value : selectedValues}
        onChange={handleChangeInternal}
        multiple={!single}
      >
        {entries.map((option) => (
          <MenuItem key={option.key} value={option.key}>{option.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

DataEnableSelect.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  labelText: PropTypes.string,
  handleChange: PropTypes.func,
  single: PropTypes.bool,
  entries: PropTypes.arrayOf(
    PropTypes.shape(SelectDataShape)
  )
}

DataEnableSelect.defaultProps = {
  labelText: 'Select Options',
  value: '',
  handleChange: null,
  entries: [],
  single: false
}
