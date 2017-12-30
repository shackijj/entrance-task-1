const {createError} = require('apollo-errors')

const TransactionError = createError('TransactionError', {
  message: 'An error has occured during transaction'
})

const ValidationError = createError('ValidationError', {
  message: 'input data is not valid'
})

module.exports = {
  TransactionError,
  ValidationError
}
