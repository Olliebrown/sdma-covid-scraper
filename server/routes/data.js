// Basic HTTP routing library
import Express from 'express'
import MongoDB from 'mongodb'

import { runQuery } from '../mongo/dbConnect.js'

// Extract ObjectId for easy usage
const { ObjectId } = MongoDB

// Create a router to attach to an express server app
const router = new Express.Router()

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
        console.error('No documents returned for range query')
        return res.status(500).send({ error: 'No documents returned' })
      }

      // Sanitize the dates
      docs.forEach((curDoc) => {
        curDoc.timestamp = (new Date(curDoc?.timestamp)).valueOf()
        curDoc.data.lastUpdated = (new Date(curDoc?.data?.lastUpdated)).valueOf()
      })

      // Return the data
      return res.send(docs)
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

export default router
