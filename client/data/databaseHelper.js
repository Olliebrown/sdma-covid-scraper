import axios from 'axios'

export function getAvailableDates (includeInvalid) {
  return new Promise((resolve, reject) => {
    axios.get(`/data/list${includeInvalid ? '/true' : ''}`)
      .then((response) => {
        if (response?.data) {
          return resolve(response.data)
        }
        return reject(new Error('Invalid or empty response'))
      })
      .catch((err) => { return reject(err) })
  })
}

export function getData (entryId) {
  return new Promise((resolve, reject) => {
    axios.get(`/data/${entryId}`)
      .then((response) => {
        if (response?.data) {
          // Compute derived values and return
          response.data.counts = computeCounts(response.data)
          return resolve(response.data)
        }
        console.error('DB: Response is empty or invalid')
        return reject(new Error('Invalid or empty response'))
      })
      .catch((err) => { return reject(err) })
  })
}

/**
 * Retrieve data entries within a range
 * @param {DateTime} startDate Start of date range as a Luxon DateTime
 * @param {DateTime} endDate End of date range as a Luxon DateTime
 * @returns Promise that resolves to an array of results within the given range
 */
export function getDataBetween (startDate, endDate) {
  return new Promise((resolve, reject) => {
    axios.get(`/data/between/${startDate.valueOf()}/${endDate.valueOf()}`)
      .then((response) => {
        if (Array.isArray(response?.data)) {
          // Compute derived values and return
          response.data.forEach((curData, i) => {
            response.data[i].counts = computeCounts(curData)
          })
          return resolve(response.data)
        }
        console.error('DB: Response is empty or invalid')
        return reject(new Error('Invalid or empty response'))
      })
      .catch((err) => { return reject(err) })
  })
}

function computeCounts (rawData) {
  return {
    '4K': sanitizedCount(rawData.data['4K'].CurrentStudentExclusions, rawData.data['4K'].PCTStudentsExcluded),
    Downsville: sanitizedCount(rawData.data.Downsville.CurrentStudentExclusions, rawData.data.Downsville.PCTStudentsExcluded),
    Knapp: sanitizedCount(rawData.data.Knapp.CurrentStudentExclusions, rawData.data.Knapp.PCTStudentsExcluded),
    Oaklawn: sanitizedCount(rawData.data.Oaklawn.CurrentStudentExclusions, rawData.data.Oaklawn.PCTStudentsExcluded),
    RiverHeights: sanitizedCount(rawData.data.RiverHeights.CurrentStudentExclusions, rawData.data.RiverHeights.PCTStudentsExcluded),
    Wakanda: sanitizedCount(rawData.data.Wakanda.CurrentStudentExclusions, rawData.data.Wakanda.PCTStudentsExcluded),
    MiddleSchool: sanitizedCount(rawData.data.MiddleSchool.CurrentStudentExclusions, rawData.data.MiddleSchool.PCTStudentsExcluded),
    HighSchool: sanitizedCount(rawData.data.HighSchool.CurrentStudentExclusions, rawData.data.HighSchool.PCTStudentsExcluded)
  }
}

function sanitizedCount (total, percent) {
  if (typeof percent === 'number' && Math.abs(percent) < 1e-4) {
    return Infinity
  }
  return Math.round(total / (percent / 100))
}
