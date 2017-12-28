const express = require('express')
const bodyParser = require('body-parser')

const graphqlHTTP = require('express-graphql')
const { makeExecutableSchema } = require('graphql-tools')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const connectSequelize = require('./sequelize-connector')

const request = require('request-promise')

const PORT = 3000

function start () {
  return connectSequelize().then(sequelize => {
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers: resolvers()
    })

    const app = express()

    app.use(bodyParser.json())
    app.use('/graphql', graphqlHTTP({
      schema,
      graphiql: true,
      context: {
        sequelize: sequelize.models
      }
    }))

    return new Promise((resolve, reject) => {
      const server = app.listen(PORT, (err) => {
        if (err) {
          reject(err)
        }
        resolve({
          app: server,
          sequelize
        })
      })
    })
  })
}

function stop ({app, sequelize}) {
  return new Promise((resolve, reject) => {
    app.close(() => {
      sequelize.close()
        .then(resolve, reject)
    }, reject)
  })
}

function runQuery ({app}, query) {
  return request({
    method: 'POST',
    baseUrl: `http://localhost:${app.address().port}`,
    uri: '/graphql',
    body: { query },
    resolveWithFullResponse: true,
    json: true
  })
}

module.exports = {
  start,
  stop,
  runQuery
}

if (require.main === module) {
  start()
}
