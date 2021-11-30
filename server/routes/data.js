// Basic HTTP routing library
import Express from 'express'
import MongoDB from 'mongodb'

import { runQuery } from '../mongo/dbConnect.js'

import { DateTime, Interval } from 'luxon'

// Extract ObjectId for easy usage
const { ObjectId } = MongoDB

// Create a router to attach to an express server app
const router = new Express.Router()

// Generator for range of dates
function * days (interval) {
  let cursor = interval.start.startOf('day')
  while (cursor <= interval.end) {
    yield cursor
    cursor = cursor.plus({ days: 1 })
  }
}

// ******* API routes **************
// List all data entries in the database
router.get('/list', (req, res) => {
  runQuery((db) => {
    db.collection('data').aggregate([
      { $sort: { 'data.lastUpdated': -1 } },
      {
        $project: {
          lastUpdated: '$data.lastUpdated',
          lastUpdatedStr: '$data.lastUpdatedStr'
        }
      }
    ]).toArray()
      .then((data) => {
        // Convert ISO string time to epoch milliseconds
        const remapped = data.map((item) => ({
          ...item,
          lastUpdated: (new Date(item.lastUpdated)).valueOf()
        }))
        return res.send(remapped)
      })
      .catch((err) => {
        console.error('Failed to list data entries', err)
        return res.status(500).send({ error: 'Internal server error' })
      })
  })
})

router.get('/between/:startDate/:endDate', (req, res) => {
  // Validate the given dates
  const startDate = new Date(parseInt(req.params.startDate))
  const endDate = new Date(parseInt(req.params.endDate))
  if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) {
    return res.status(400).send({ error: 'Bad request, invalid date range' })
  }

  // Attempt to locate the data
  runQuery((db) => {
    db.collection('data').find({
      'data.lastUpdated': {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ 'data.lastUpdated': 1 }).toArray((err, docs) => {
      // Check for errors
      if (err) {
        console.error('Failed to find data in range', startDate, 'to', endDate)
        console.error(err)
        return res.status(500).send({ error: 'Internal server error' })
      }

      // Check for empty response
      if (!Array.isArray(docs) || docs.length === 0) {
        return res.send([])
      }

      // Sanitize the dates
      docs.forEach((curDoc) => {
        curDoc.timestamp = (new Date(curDoc?.timestamp)).valueOf()
        curDoc.data.lastUpdated = (new Date(curDoc?.data?.lastUpdated)).valueOf()
      })

      // Pad the data with missing days
      const interval = Interval.fromDateTimes(
        DateTime.fromJSDate(startDate),
        DateTime.fromJSDate(endDate)
      )

      const paddedDocs = []
      let docIndex = 0
      for (const d of days(interval)) {
        // Remember length
        const startLength = paddedDocs.length

        // Add all docs that match the given day
        let curDoc = docs[docIndex]
        let lastUpdated = DateTime.fromMillis(curDoc?.data?.lastUpdated || 0)
        while (lastUpdated.startOf('day').toMillis() === d.toMillis()) {
          paddedDocs.push(curDoc)
          docIndex++
          curDoc = docs[docIndex]
          lastUpdated = DateTime.fromMillis(curDoc?.data?.lastUpdated || 0)
        }

        // If none added, push a null
        if (paddedDocs.length === startLength) {
          paddedDocs.push(makeNullDoc(d))
        }
      }

      // Return the data
      return res.send(paddedDocs)
    })
  })
})

router.get('/:id', (req, res) => {
  // Validate the given id
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ error: 'Bad request, invalid data id' })
  }

  // Attempt to locate the data
  runQuery((db) => {
    db.collection('data').findOne({ _id: new ObjectId(req.params.id) })
      .then((dataRecord) => {
        // Sanitize the dates
        dataRecord.timestamp = (new Date(dataRecord?.timestamp)).valueOf()
        dataRecord.data.lastUpdated = (new Date(dataRecord?.data?.lastUpdated)).valueOf()

        // Return the data
        return res.send(dataRecord)
      })
      .catch((err) => {
        console.error('Failed to find data with id:', req.params.id)
        console.error(err)
        return res.status(500).send({ error: 'Internal server error' })
      })
  })
})

const EMPTY_DATA = {
  StudentCurrentPositive: null,
  StudentClosedPositive: null,
  CurrentStudentExclusions: null,
  PCTStudentsExcluded: null,
  StaffCurrentPositive: null,
  StaffClosedPositive: null,
  CurrentStaffExclusions: null
}

/**
 * Make an empty document with a particular date
 * @param {DateTime} date The date to use in the null doc
 * @returns An object with the same structure as a DB doc but all empty data
 */
function makeNullDoc (date) {
  return {
    _id: null,
    timestamp: 0,
    data: {
      lastUpdated: date.toMillis(),
      lastUpdatedStr: date.toFormat('LLLL dd, yyyy h:mm a'),
      '4K': EMPTY_DATA,
      Downsville: EMPTY_DATA,
      Knapp: EMPTY_DATA,
      Oaklawn: EMPTY_DATA,
      RiverHeights: EMPTY_DATA,
      Wakanda: EMPTY_DATA,
      MiddleSchool: EMPTY_DATA,
      HighSchool: EMPTY_DATA,
      TOTAL: EMPTY_DATA,
      TOTALPERCENTAGE: EMPTY_DATA,
      notes: []
    },
    rawCsv: ''
  }
}

export default router
