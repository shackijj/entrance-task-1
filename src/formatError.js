const {formatError} = require('express-graphql')

module.export = (error) => {
  const data = formatError(error)
  const {originalError} = error
  data.field = originalError && originalError.field
  return data
}
