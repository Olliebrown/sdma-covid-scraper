import LuxonUtils from '@date-io/luxon'

// From: https://github.com/mui-org/material-ui-pickers/issues/1626#issuecomment-612031743
class DataWrapper {
  constructor () {
    this.default = [
      {
        index: 0,
        name: 'Sun',
        dayName: 'S'
      },
      {
        index: 1,
        name: 'Mon',
        dayName: 'M'
      },
      {
        index: 2,
        name: 'Tue',
        dayName: 'T'
      },
      {
        index: 3,
        name: 'Wed',
        dayName: 'W'
      },
      {
        index: 4,
        name: 'Thu',
        dayName: 'T'
      },
      {
        index: 5,
        name: 'Fri',
        dayName: 'F'
      },
      {
        index: 6,
        name: 'Sat',
        dayName: 'S'
      }
    ]

    this.dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    this.processedDayNames = []
    this.startDay = this.default[0]
  }

  setStartDay (dayName) {
    const x = this.default.filter(day => dayName === day.name)
    this.startDay = x[0]
  }

  processWeekDayOrder () {
    const days = [...this.dayNames]
    const remainingDays = days.splice(0, this.startDay.index)
    this.processedDayNames = days.concat(remainingDays)
    return this.processedDayNames
  }
}

export default class CustomLuxonUtils extends LuxonUtils {
  constructor () {
    super()
    this.dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    this.wrapper = new DataWrapper()
    // this.wrapper.setStartDay('Sun')
  }

  getWeekdays () {
    return this.wrapper.processWeekDayOrder()
  }

  getWeekArray (date) {
    const index = this.wrapper.startDay.index
    const endDate = date
      .endOf('month')
      // if a month ends on sunday, luxon will consider it already the end of the week
      // but we need to get the _entire_ next week to properly lay that out
      // so we add one more day to cover that before getting the end of the week
      .plus({ days: index !== 0 ? this.dayNames.length + 1 - index : 1 })
      .endOf('week')
    const startDate = date
      .startOf('month')
      .startOf('week')
      // must subtract 1, because startOf('week') will be Mon, but we want weeks to start on Sun
      // this is the basis for every day in a our calendar
      .minus({ days: index !== 0 ? this.dayNames.length + 1 - index : 1 })

    const { days } = endDate.diff(startDate, 'days').toObject()

    const weeks = []
    new Array(Math.round(days))
      .fill(0)
      .map((_, i) => i)
      .map(day => startDate.plus({ days: day }))
      .forEach((v, i) => {
        if (i === 0 || (i % 7 === 0 && i > 6)) {
          weeks.push([v])
          return
        }

        weeks[weeks.length - 1].push(v)
      })

    // a consequence of all this shifting back/forth 1 day is that you might end up with a week
    // where all the days are actually in the previous or next month.
    // this happens when the first day of the month is Sunday (Dec 2019 or Mar 2020 are examples)
    // or the last day of the month is Sunday (May 2020 or Jan 2021 is one example)
    // so we're only including weeks where ANY day is in the correct month to handle that
    return weeks.filter(w => w.some(d => d.month === date.month))
  }
}
