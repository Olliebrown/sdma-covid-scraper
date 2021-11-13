// Useful 3rd party libraries
import cron from 'node-cron'

import { dataAsCSV, parseCSVToData, addToDB, getLatestFromDB } from './dataHelper.js'

// Info that points to the SDMA doc
const DOC_ID = '1y7J0hskF47_lDYMmgDj57jLThMCfnwrG'

// Retrieve the data on a regular interval
cron.schedule('0 0,6,12,18 * * *', async () => {
  try {
    const csvData = await dataAsCSV(DOC_ID)
    const latestData = await getLatestFromDB()
    if (csvData !== latestData?.rawCsv) {
      const fullJsonData = await parseCSVToData(csvData)
      await addToDB(fullJsonData, csvData)
    }
  } catch (err) {
    console.error('Failed to retrieve and save data')
    console.error(err)
  }
})
