import { atom, selector } from 'recoil'

import { getAvailableDates, getData } from './databaseHelper'
import Papa from 'papaparse'

export const AvailableDatesState = atom({
  key: 'AvailableDatesState',
  default: [],
  effects_UNSTABLE: [
    ({ setSelf }) => {
      // Initialize from asynchronous DB retrieval
      const availableDatesPromise = getAvailableDates()
      setSelf(availableDatesPromise)
    }
  ]
})

export const ActiveDateIndexState = atom({
  key: 'ActiveDateIndexState',
  default: 0
})

export const ActiveDateState = selector({
  key: 'ActiveDateState',
  get: ({ get }) => {
    const availableDates = get(AvailableDatesState)
    const activeIndex = get(ActiveDateIndexState)

    if (activeIndex >= 0 && activeIndex < availableDates.length) {
      return availableDates[activeIndex].lastUpdated
    }

    return null
  }
})

export const ActiveDateIdState = selector({
  key: 'ActiveDateIdState',
  get: ({ get }) => {
    const availableDates = get(AvailableDatesState)
    const activeIndex = get(ActiveDateIndexState)

    if (activeIndex >= 0 && activeIndex < availableDates.length) {
      return availableDates[activeIndex]._id
    }

    return null
  }
})

export const CurrentDataState = selector({
  key: 'CurrentDataState',
  get: async ({ get }) => {
    const activeDateId = get(ActiveDateIdState)
    if (activeDateId) {
      try {
        const currentData = await getData(activeDateId)
        return currentData
      } catch (err) {
        window.alert('There was an error retrieving the requested data.\n\n(see console for more info)')
        console.error('Failed to retrieve data')
        console.error(err)
        return null
      }
    }
  }
})

export const ParsedDataState = selector({
  key: 'ParsedDataState',
  get: async ({ get }) => {
    try {
      const currentData = await get(CurrentDataState)
      const output = Papa.parse(currentData.rawCsv, { delimiter: ',', header: false })
      if (output.errors.length > 0) { throw new Error(output.errors.join(',')) }

      // Remove trailing empty cells
      const rows = output.data.map((row) => {
        let last = row.length - 1
        while (!row[last] && last > 0) { last-- }
        if (last === 0 && !row[0]) return []
        return row.slice(0, last + 1)
      })

      return rows
    } catch (err) {
      console.error('Failed to parse CSV')
      console.error(err)
      return null
    }
  }
})
