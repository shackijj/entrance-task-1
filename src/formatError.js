const {formatError, createError} = require('apollo-errors')
const {GraphQLError} = require('graphql')

const UnknownError = createError('UnknownError', {
  message: 'An unknown error has occured'
})

module.exports = error => {
  let err = formatError(error)
  if (err instanceof GraphQLError) {
    err = formatError(new UnknownError({
      data: {
        originalMessage: err.message,
        originalError: err.name
      }
    }))
  }

  return err
}
