// Standard node libraries
import fs from 'fs'
import path from 'path'
import http from 'http'
import https from 'https'

// Useful 3rd party libraries
import Express from 'express'

// Custom router for serving data
import dataRouter from './routes/data.js'

// The reoccurring scraping task
import { scheduleScraping } from './scraper/scraperTask.js'
scheduleScraping()

// Initialize express app
const app = new Express()

// Build HTTP/HTTPS server
let server
if (process.env.HEROKU) {
  // Create normal HTTP server (heroku handles SSL)
  server = http.createServer(app)
} else {
  // Not HEROKU so make an HTTPS server
  const SSL_KEY_FILE = process.env.SERVER_KEY || './certs/server.key'
  const SSL_CERT_FILE = process.env.SERVER_CERT || './certs/server.crt'
  const SSLOptions = {
    key: fs.readFileSync(SSL_KEY_FILE),
    cert: fs.readFileSync(SSL_CERT_FILE)
  }

  // Make an HTTPS express server app
  server = https.createServer(SSLOptions, app)
}

// Redirect all non-ssl traffic to HTTPS
// TODO: Need to install certificate first
// if (process.env.HEROKU && !process.env.LOCAL) {
//   app.use((req, res, next) => {
//     const reqType = req.headers['x-forwarded-proto']
//     if (reqType === 'https') {
//       next()
//     } else {
//       return res.redirect('https://' + req.headers.host + req.url)
//     }
//   })
// }

// All data routes are under '/data/'
app.use('/data', dataRouter)

// Everything else is a static file
app.use('/', Express.static(path.resolve('./public')))

// Start listening on ports listed in .env
const DEV_PORT = process.env.DEV_PORT || 3000
const PROD_PORT = process.env.PORT || process.env.PROD_PORT || 42424
if (process.argv.find((arg) => { return arg === 'dev' })) {
  // Start server listening on debug/dev port
  server.listen(DEV_PORT, 'localhost', () => {
    console.log(`SDMA Scrape DEV server listening on port ${DEV_PORT}`)
  })
} else {
  // Start server listening on main/production port
  server.listen(PROD_PORT, '0.0.0.0', () => {
    console.log(`SDMA Scrape server listening on port ${PROD_PORT}`)
  })
}

// Log on SIGINT and SIGTERM before exiting
function handleSignal (signal) {
  process.exit(0)
}
process.on('SIGINT', handleSignal)
process.on('SIGTERM', handleSignal)
