import { atom, selector } from 'recoil'

import { getDataBetween } from './databaseHelper'
import { DateTime } from 'luxon'

// Start and end dates for ranged data
export const StartDateState = atom({
  key: 'StartDateState',
  default: DateTime.local().startOf('week')
})

// Start date when examining a range
export const EndDateState = atom({
  key: 'EndDateState',
  default: DateTime.local().startOf('week').plus({ days: 4 })
})

// Should times be normalized to noon on each day?
export const NormalizeTimesState = atom({
  key: 'NormalizeTimesState',
  default: true
})

export const CurrentRangeDataState = selector({
  key: 'CurrentRangeDataState',
  get: async ({ get }) => {
    const startDate = get(StartDateState)
    const endDate = get(EndDateState)
    if (startDate instanceof DateTime && !startDate.invalid && endDate instanceof DateTime && !endDate.invalid) {
      try {
        const currentData = await getDataBetween(startDate, endDate)
        return currentData
      } catch (err) {
        window.alert('There was an error retrieving the requested data.\n\n(see console for more info)')
        console.error('Failed to retrieve range data')
        console.error(startDate.toISODate(), 'to', endDate.toISODate())
        console.error(err)
        return null
      }
    } else {
      console.error('Start or end date ID is invalid when looking for current range data state')
      console.error(startDate, 'to', endDate)
      return null
    }
  }
})
