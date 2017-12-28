const { start } = require('./src/server')

const PORT = 3000

start(PORT).then(({app}) => {
  console.log(`Graphql server is listening on http://localhost:${PORT}`)
})
