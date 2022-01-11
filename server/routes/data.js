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
  cursor.setZone('local')
  while (cursor <= interval.end) {
    yield cursor
    cursor = cursor.plus({ days: 1 })
  }
}

// ******* API routes **************
// List all data entries in the database
router.get('/list/:includeInvalid?', (req, res) => {
  // Setup match-find query
  const findQuery = { invalid: { $in: [false, null, undefined] } }
  if (req.params.includeInvalid) {
    delete findQuery.invalid
  }

  runQuery((db) => {
    db.collection('data').aggregate([
      { $match: findQuery },
      { $sort: { 'data.lastUpdated': -1 } },
      {
        $project: {
          lastUpdated: '$data.lastUpdated',
          lastUpdatedStr: '$data.lastUpdatedStr',
          invalid: 1
        }
      }
    ]).toArray()
      .then((data) => {
        // Convert ISO string time to epoch milliseconds
        const remapped = data.map((item) => ({
          ...item,
          lastUpdated: sanitizeTimezone(item.lastUpdated)
        }))
        return res.send(remapped)
      })
      .catch((err) => {
        console.error('Failed to list data entries', err)
        return res.status(500).send({ error: 'Internal server error' })
      })
  })
})

router.get('/between/:startDate/:endDate/:includeInvalid?', (req, res) => {
  // Validate the given dates
  const startDate = new Date(parseInt(req.params.startDate))
  const endDate = new Date(parseInt(req.params.endDate))
  if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) {
    return res.status(400).send({ error: 'Bad request, invalid date range' })
  }

  // Clamp end date
  const clampedEndDate = DateTime.fromJSDate(endDate).endOf('day').toJSDate()

  // Setup find query
  const findQuery = {
    'data.lastUpdated': {
      $gte: startDate,
      $lte: clampedEndDate
    },
    invalid: { $in: [false, null, undefined] }
  }
  if (req.params.includeInvalid) {
    delete findQuery.invalid
  }

  // Attempt to locate the data
  runQuery((db) => {
    db.collection('data').find(findQuery)
      .sort({ 'data.lastUpdated': 1 })
      .toArray((err, docs) => {
        // Check for errors
        if (err) {
          console.error('Failed to find data in range', startDate, 'to', clampedEndDate)
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
          curDoc.data.lastUpdated = sanitizeTimezone(curDoc?.data?.lastUpdated)
        })

        // Pad the data with missing days
        const interval = Interval.fromDateTimes(
          DateTime.fromJSDate(startDate).setZone('local'),
          DateTime.fromJSDate(endDate).setZone('local')
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

          // If none added, push a null doc (weekends only)
          if (paddedDocs.length === startLength && d.weekday >= 6) {
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
        dataRecord.data.lastUpdated = sanitizeTimezone(dataRecord?.data?.lastUpdated)

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

function sanitizeTimezone (isoStringWithoutTimezone) {
  return DateTime.fromJSDate(new Date(isoStringWithoutTimezone)).toMillis()
}

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
    rawCsv: '',
    invalid: true
  }
}

export default router
