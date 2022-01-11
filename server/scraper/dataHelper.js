import axios from 'axios'
import { runQuery, closeClient } from '../mongo/dbConnect.js'

import CSVParse from 'csv-parse'
import { DateTime } from 'luxon'

// Re-export closeClient
export { closeClient }

const FORMAT_STRINGS = [
  'LLLL d, yyyy h:mm a',
  'LLLL dd, yyyy h:mm a',
  'LLLL d, h:mm a',
  'LLLL dd, h:mm a'
]

export async function dataAsCSV (docID) {
  try {
    const response = await axios.get(`https://docs.google.com/spreadsheets/d/${docID}/export?format=csv`)
    return response?.data
  } catch (err) {
    console.error('Failed to retrieve csv data')
    console.error(err)
    return null
  }
}

export function parseCSVToData (csvData) {
  return new Promise((resolve, reject) => {
    CSVParse(
      csvData,
      { skipEmptyLines: true, skip_lines_with_empty_values: true },
      (err, output) => {
        // Check for errors
        if (err) {
          console.error('Failed to parse CSV')
          return reject(err)
        }

        // Throw away first line (sheet title)
        output.shift()

        // Parse headers out of next line (and clean them up)
        const headers = output[0].map(
          (header) => (header.replace(/%/g, 'PCT').replace(/[\W]+(\\n)*/g, ''))
        )

        // Loop over remaining rows
        const allData = {}
        let lastDataRow = output.length
        let lastUpdatedStr = ''
        for (let row = 1; row < output.length; row++) {
          const rowData = {}
          let rowName = ''
          output[row].forEach((cell, i) => {
            // Skip leading empty cells
            if (headers[i] !== '') {
              // First data always treat as row name
              if (rowName === '') {
                rowName = cell
              } else {
                // Determine data type and store with header name
                if (cell.includes('%')) {
                  rowData[headers[i]] = parseFloat(cell)
                } else if (parseInt(cell) != null) {
                  rowData[headers[i]] = parseInt(cell)
                } else {
                  rowData[headers[i]] = cell
                }
              }
            }
          })

          // Stop when we reach the last updated entry
          if (rowName.toLowerCase().includes('last updated')) {
            lastUpdatedStr = rowName.replace(/\s+/g, ' ').trim()
            if (lastUpdatedStr.match(/:(.*)/)) {
              lastUpdatedStr = lastUpdatedStr.match(/:(.*)/)[1].trim()
            }
            lastDataRow = row
            break
          }

          // Add to data
          allData[rowName.replace(/%/g, 'PCT').replace(/[\W]+(\\n)*/g, '')] = rowData
        }

        // Parse out notes
        let notes = []
        for (let row = lastDataRow + 1; row < output.length; row++) {
          const newNotes = output[row].map((note) => (note.trim())).filter((note) => (note !== ''))
          notes = [...notes, ...newNotes]
        }

        // Attempt to parse lastUpdated
        let lastUpdated = null
        let index = 0
        do {
          lastUpdated = DateTime.fromFormat(
            lastUpdatedStr, FORMAT_STRINGS[index], {
              zone: 'America/Chicago', setZone: true
            }
          )
          index++
        } while (lastUpdated?.invalid && index < FORMAT_STRINGS.length)

        // Resolve with the results
        return resolve({ lastUpdated, lastUpdatedStr, ...allData, notes })
      }
    )
  })
}

export function addToDB (data, csvData) {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('data').insertOne({ timestamp: DateTime.local(), data, rawCsv: csvData, invalid: false })
        .then((data) => { return resolve(data.insertedId) })
        .catch((err) => {
          console.error('Failed to save to DB', err)
          return reject(err)
        })
    })
  })
}

export function getLatestFromDB () {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('data').findOne({}, { sort: { 'data.lastUpdated': -1 } })
        .then((data) => {
          return resolve(data)
        })
        .catch((err) => {
          console.error('Failed to retrieve latest entry from DB', err)
          return reject(err)
        })
    })
  })
}

export function getDataForDateFromDB (lastUpdated) {
  return new Promise((resolve, reject) => {
    runQuery((db) => {
      db.collection('data').findOne({ 'data.lastUpdated': lastUpdated })
        .then((data) => {
          if (!data) { return resolve(null) }
          return resolve(data)
        })
        .catch((err) => {
          console.error('Failed to retrieve latest entry from DB', err)
          return reject(err)
        })
    })
  })
}
