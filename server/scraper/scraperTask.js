// For scheduling a repeating task
import cron from 'node-cron'

// Helper functions for scraping
import { dataAsCSV, parseCSVToData, addToDB, getLatestFromDB } from './dataHelper.js'

// Info that points to the SDMA doc
const DOC_ID = '1y7J0hskF47_lDYMmgDj57jLThMCfnwrG'

// Retrieve the data on a regular interval
export function scheduleScraping () {
  console.log('Scheduling cron scraping job.')
  cron.schedule('0,30 * * * *', async () => {
    console.log('Checking for new data...')
    try {
      const csvData = await dataAsCSV(DOC_ID)
      const latestData = await getLatestFromDB()
      if (csvData !== latestData?.rawCsv) {
        console.log('Data differs, parsing and saving.')
        const fullJsonData = await parseCSVToData(csvData)
        const result = await addToDB(fullJsonData, csvData)
        console.log(`\t... done, inserted ${result}.`)
      } else {
        console.log('Data has not changed.')
      }
    } catch (err) {
      console.error('Failed to retrieve and save data')
      console.error(err)
    }
  })
}
