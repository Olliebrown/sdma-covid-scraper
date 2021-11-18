import axios from 'axios'

export function getAvailableDates () {
  return new Promise((resolve, reject) => {
    axios.get('/data/list')
      .then((response) => {
        if (response?.data) {
          return resolve(response.data)
        }
        return reject(new Error('Invalid or empty response'))
      })
      .catch((err) => { return reject(err) })
  })
}

export function getData (entryId) {
  return new Promise((resolve, reject) => {
    axios.get(`/data/${entryId}`)
      .then((response) => {
        if (response?.data) {
          return resolve(response.data)
        }
        console.error('DB: Response is empty or invalid')
        return reject(new Error('Invalid or empty response'))
      })
      .catch((err) => { return reject(err) })
  })
}
