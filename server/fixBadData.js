import { DateTime } from 'luxon'
import { getBadDataForDateFromDB, updateDocument } from './scraper/dataHelper.js'

const FORMAT_STRINGS = [
  'LLLL d, yyyy h:mm a',
  'LLLL dd, yyyy h:mm a',
  'LLLL d, h:mm a',
  'LLLL dd, h:mm a'
]

async function goForIt () {
  try {
    const docs = await getBadDataForDateFromDB()
    docs.forEach(async (doc) => {
      // Fix spelling
      doc.data.lastUpdatedStr = doc.data.lastUpdatedStr.replace('Feburary', 'February')

      // Re-parse string
      let lastUpdated = ''
      let index = 0
      do {
        lastUpdated = DateTime.fromFormat(
          doc.data.lastUpdatedStr, FORMAT_STRINGS[index], {
            zone: 'America/Chicago', setZone: true
          }
        )
        index++
      } while (lastUpdated?.invalid && index < FORMAT_STRINGS.length)

      if (index >= FORMAT_STRINGS.length) {
        console.error('Failed to re-parse date')
      } else {
        doc.data.lastUpdated = lastUpdated
        try {
          await updateDocument(doc)
          console.log(`Updated ${doc._id}`)
        } catch (err) {
          console.error(`Error updating ${doc._id}`)
          console.error(err)
        }
      }
    })
  } catch (err) {
    console.error('Error retrieving')
    console.error(err)
  }
}

goForIt()
