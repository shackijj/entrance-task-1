const {createError} = require('apollo-errors')

const TransactionError = createError('TransactionError', {
  message: 'An error has occured during transcation'
})

module.exports = {
  TransactionError
}
