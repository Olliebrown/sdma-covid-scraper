import fs from 'fs'

import { closeClient } from './server/mongo/dbConnect.js'
import { getLatestFromDB, parseCSVToData, addToDB } from './server/scraper/dataHelper.js'

// A function very similar to the cron job version that takes a filename
// instead and loads the CSV data from there.
async function manuallyAddData (filename) {
  try {
    const csvData = fs.readFileSync(filename, { encoding: 'utf8' })
    const latestData = await getLatestFromDB()
    if (csvData !== latestData?.rawCsv) {
      const fullJsonData = await parseCSVToData(csvData)
      await addToDB(fullJsonData, csvData)
      await closeClient()
    }
  } catch (err) {
    console.error('Failed to read and save data')
    console.error(err)
  }
}

// Get filename from parameters
if (process.argv.length < 3) {
  console.error('Missing filename')
} else {
  manuallyAddData(process.argv[2])
}
