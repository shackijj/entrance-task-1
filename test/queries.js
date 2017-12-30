const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('Query', () => {
  let server

  before(() => {
    return start()
      .then((instace) => {
        server = instace
        return instace
      })
      .then(clearDatabase)
  })

  after(() => {
    return stop(server)
  })
})
