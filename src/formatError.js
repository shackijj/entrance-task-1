const {formatError, createError} = require('apollo-errors')
const {GraphQLError} = require('graphql')

const UnknownError = createError('UnknownError', {
  message: 'An unknown error has occured'
})

module.exports = error => {
  console.log('HERE', error)
  let err = formatError(error)
  if (err instanceof GraphQLError) {
    err = formatError(new UnknownError({
      data: {
        originaMessage: err.message,
        originalError: err.name
      }
    }))
  }

  return err
}
