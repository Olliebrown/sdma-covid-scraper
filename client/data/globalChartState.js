import { atom, selector } from 'recoil'
import PropTypes from 'prop-types'

export const SelectDataShape = {
  key: PropTypes.string,
  label: PropTypes.string,
  color: PropTypes.string,
  enabled: PropTypes.bool
}

export const ShowAdvancedState = atom({
  key: 'ShowAdvancedState',
  default: false
})

export const ChartSeriesState = atom({
  key: 'ChartSeriesState',
  default: [
    { key: 'StudentCurrentPositive', label: 'Student Active Positive', color: '#f05365', enabled: true },
    { key: 'StudentClosedPositive', label: 'Student Closed Positive', color: '#2d7dd2', enabled: true },
    { key: 'CurrentStudentExclusions', label: 'Student Exclusions', color: '#b388eb', enabled: true },
    { key: 'PCTStudentsExcluded', label: 'Student Exclusions (%)', color: '#513c2c', enabled: false },
    { key: 'StaffCurrentPositive', label: 'Staff Active Positive', color: '#c5afa0', enabled: false },
    { key: 'StaffClosedPositive', label: 'Staff Closed Positive', color: '#ff6b35', enabled: false },
    { key: 'CurrentStaffExclusions', label: 'Staff Exclusions', color: '#15b097', enabled: false }
  ],
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet(newValue => {
        console.debug('Current Series Changed:', newValue)
      })
    }
  ]
})

export const SingleSeriesState = atom({
  key: 'SingleSeriesState',
  default: [
    { key: 'StudentCurrentPositive', label: 'Student Active Positive', color: '#f05365', enabled: false },
    { key: 'StudentClosedPositive', label: 'Student Closed Positive', color: '#2d7dd2', enabled: false },
    { key: 'CurrentStudentExclusions', label: 'Student Exclusions', color: '#b388eb', enabled: true },
    { key: 'PCTStudentsExcluded', label: 'Student Exclusions (%)', color: '#513c2c', enabled: false },
    { key: 'StaffCurrentPositive', label: 'Staff Active Positive', color: '#c5afa0', enabled: false },
    { key: 'StaffClosedPositive', label: 'Staff Closed Positive', color: '#ff6b35', enabled: false },
    { key: 'CurrentStaffExclusions', label: 'Staff Exclusions', color: '#15b097', enabled: false }
  ],
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet(newValue => {
        console.debug('Single Series Changed:', newValue)
      })
    }
  ]
})

export const ActiveSingleSeriesState = selector({
  key: 'ActiveSingleSeriesState',
  get: ({ get }) => {
    const seriesData = get(SingleSeriesState)
    for (let i = 0; i < seriesData.length; i++) {
      if (seriesData[i].enabled) {
        return seriesData[i].key
      }
    }
    return ''
  }
})

export const ChartSchoolsState = atom({
  key: 'ChartSchoolsState',
  default: [
    { key: '4K', label: '4K', color: '#f05365', enabled: true },
    { key: 'Downsville', label: 'Downsville', color: '#2d7dd2', enabled: true },
    { key: 'Knapp', label: 'Knapp', color: '#b388eb', enabled: true },
    { key: 'Oaklawn', label: 'Oaklawn', color: '#513c2c', enabled: true },
    { key: 'RiverHeights', label: 'River Heights', color: '#c5afa0', enabled: true },
    { key: 'Wakanda', label: 'Wakanda', color: '#ff6b35', enabled: true },
    { key: 'MiddleSchool', label: 'Middle School', color: '#15b097', enabled: true },
    { key: 'HighSchool', label: 'High School', color: '#3d2b56', enabled: true },
    { key: 'TOTAL', label: 'District Wide', color: '#561f37', enabled: false },
    { key: 'TOTALPERCENTAGE', label: 'District Wide (%)', color: '#730071', enabled: false }
  ]
})
