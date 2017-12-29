const {createError} = require('apollo-errors')

const ValidationError = createError('ValidationError', {
  message: 'Request has invalid fields'
})

module.exports = {
  ValidationError
}
