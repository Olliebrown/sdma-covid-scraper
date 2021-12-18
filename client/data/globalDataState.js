import { atom, selector } from 'recoil'

import { getAvailableDates, getData } from './databaseHelper'
import Papa from 'papaparse'

export const AvailableDataState = atom({
  key: 'AvailableDataState',
  default: [],
  effects_UNSTABLE: [
    ({ setSelf }) => {
      // Initialize from asynchronous DB retrieval
      const availableDatesPromise = getAvailableDates(true)
      setSelf(availableDatesPromise)
    }
  ]
})

export const AvailableDatesState = selector({
  key: 'AvailableDatesState',
  get: ({ get }) => {
    const allAvailableData = get(AvailableDataState)
    if (Array.isArray(allAvailableData)) {
      const keyCounter = {}
      return allAvailableData.map((item) => {
        // Ensure all keys (last updated string and millis) are unique
        const key = item.lastUpdatedStr
        keyCounter[key] = (!keyCounter[key] ? 1 : keyCounter[key] + 1)
        if (keyCounter[key] <= 1) {
          return item
        } else {
          return {
            ...item,
            lastUpdatedStr: key + '-' + keyCounter[key],
            lastUpdated: item.lastUpdated + keyCounter[key]
          }
        }
      })
    }
    return []
  }
})

export const ValidDatesState = selector({
  key: 'ValidDatesState',
  get: ({ get }) => {
    const allAvailableData = get(AvailableDataState)
    if (Array.isArray(allAvailableData)) {
      return allAvailableData.filter((item) => (!item.invalid))
    }
    return []
  }
})

// Current date or end date when examining a range
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
      return availableDates[activeIndex].lastUpdatedStr
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
    } else {
      console.error('Date ID is null when looking for current data state')
      return null
    }
  }
})

export const CurrentDataInvalidState = selector({
  key: 'CurrentDataInvalidState',
  get: ({ get }) => {
    const currentData = get(CurrentDataState)
    return currentData.invalid
  }
})

// Data used in the raw CSV tab
export const ParsedDataState = selector({
  key: 'ParsedDataState',
  get: ({ get }) => {
    // Get the data and parse it
    const currentData = get(CurrentDataState)
    const output = Papa.parse(currentData.rawCsv, { delimiter: ',', header: false })
    if (output.errors.length > 0) {
      console.error('Error parsing CSV')
      console.error(output.errors.join(','))
      return null
    }

    // Remove trailing empty cells
    const rows = output.data.map((row) => {
      let last = row.length - 1
      while (!row[last] && last > 0) { last-- }
      if (last === 0 && !row[0]) return []
      return row.slice(0, last + 1)
    })
    return rows
  }
})
