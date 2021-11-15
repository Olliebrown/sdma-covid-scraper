import fs from 'fs'

import { closeClient } from './server/mongo/dbConnect.js'
import { parseCSVToData, addToDB, getDataForDateFromDB } from './server/scraper/dataHelper.js'

// A function very similar to the cron job version that takes a filename
// instead and loads the CSV data from there.
async function manuallyAddData (filename) {
  if (!fs.existsSync(filename)) {
    console.error('File not found:', filename)
    return
  }

  try {
    const csvData = fs.readFileSync(filename, { encoding: 'utf8' })
    const fullJsonData = await parseCSVToData(csvData)
    const existingData = await getDataForDateFromDB(fullJsonData.lastUpdated)
    if (!existingData) {
      await addToDB(fullJsonData, csvData)
    } else {
      console.error('Data already exists in database.')
      console.error('To overwrite, delete the original data first.')
    }
  } catch (err) {
    console.error('Failed to read and save data.')
    console.error(err)
  } finally {
    await closeClient()
  }
}

// Get filename from parameters
if (process.argv.length < 3) {
  console.error('Missing filename')
} else {
  manuallyAddData(process.argv[2])
}
