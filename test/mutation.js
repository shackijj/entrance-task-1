const {expect} = require('chai')

const {start, stop, runQuery, clearDatabase} = require('../src/server')

describe('Mutation', () => {
  describe('#createUser', () => {
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

    it('should create a user.', () => {
      return runQuery(server, `mutation {
        createUser(input: {login: "testUser"}) {
          login
        }
      }`).then(({body: {data, errors}}) => {
        expect(data).to.eql({
          createUser: {
            login: 'testUser'
          }
        })
      })
    })
  })
})
