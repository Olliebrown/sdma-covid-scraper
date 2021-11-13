// For scheduling a repeating task
import cron from 'node-cron'

// Helper functions for scraping
import { dataAsCSV, parseCSVToData, addToDB, getLatestFromDB } from './dataHelper.js'

// Info that points to the SDMA doc
const DOC_ID = '1y7J0hskF47_lDYMmgDj57jLThMCfnwrG'

// Retrieve the data on a regular interval
export function scheduleScraping () {
  cron.schedule('0,30 * * * *', async () => {
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
}
