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
        dataRecord.timestamp = (new Date(dataRecord?.timestamp).valueOf())
        dataRecord.data.lastUpdated = (new Date(dataRecord?.data?.lastUpdated).valueOf())

        // Compute derived values
        dataRecord.counts = {
          '4K': Math.round(dataRecord.data['4K'].CurrentStudentExclusions / (dataRecord.data['4K'].PCTStudentsExcluded / 100)),
          Downsville: Math.round(dataRecord.data.Downsville.CurrentStudentExclusions / (dataRecord.data.Downsville.PCTStudentsExcluded / 100)),
          Knapp: Math.round(dataRecord.data.Knapp.CurrentStudentExclusions / (dataRecord.data.Knapp.PCTStudentsExcluded / 100)),
          Oaklawn: Math.round(dataRecord.data.Oaklawn.CurrentStudentExclusions / (dataRecord.data.Oaklawn.PCTStudentsExcluded / 100)),
          RiverHeights: Math.round(dataRecord.data.RiverHeights.CurrentStudentExclusions / (dataRecord.data.RiverHeights.PCTStudentsExcluded / 100)),
          Wakanda: Math.round(dataRecord.data.Wakanda.CurrentStudentExclusions / (dataRecord.data.Wakanda.PCTStudentsExcluded / 100)),
          MiddleSchool: Math.round(dataRecord.data.MiddleSchool.CurrentStudentExclusions / (dataRecord.data.MiddleSchool.PCTStudentsExcluded / 100)),
          HighSchool: Math.round(dataRecord.data.HighSchool.CurrentStudentExclusions / (dataRecord.data.HighSchool.PCTStudentsExcluded / 100))
        }

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
