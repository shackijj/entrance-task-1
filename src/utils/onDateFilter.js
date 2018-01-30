const moment = require('moment')

const onDateFilter = (date) => ({
  $and: {
    $gt: moment(date).startOf('day').toDate(),
    $lt: moment(date).endOf('day').toDate()
  }
})

module.exports = onDateFilter
