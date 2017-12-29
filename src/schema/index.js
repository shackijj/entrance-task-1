const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const { makeExecutableSchema } = require('graphql-tools')

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers: resolvers()
})
