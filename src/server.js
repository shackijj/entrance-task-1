const express = require('express')
const bodyParser = require('body-parser')

const {graphqlExpress, graphiqlExpress} = require('apollo-server-express')
const formatError = require('./formatError')

const schema = require('./schema')
const connectSequelize = require('./sequelize-connector')
const request = require('request-promise')

function start (port = 9000) {
  return connectSequelize().then(sequelize => {
    const app = express()

    app.use(bodyParser.json())
    app.post('/graphql', graphqlExpress({
      schema,
      formatError,
      context: {
        sequelize: sequelize.models
      }
    }))

    app.get('/graphql', graphiqlExpress({endpointURL: '/graphql'}))

    return new Promise((resolve, reject) => {
      const server = app.listen(port, (err) => {
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

function clearDatabase ({sequelize: {models}}) {
  const promises = Object.entries(models).map(([name, model]) => {
    return model.destroy({truncate: true})
  })

  return Promise.all(promises)
}

module.exports = {
  start,
  stop,
  runQuery,
  clearDatabase
}
