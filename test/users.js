const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('#users', () => {
  let server

  before(() => {
    return start()
      .then((instace) => {
        server = instace
        return instace
      })
      .then(clearDatabase)
      .then(() => {
        const {sequelize: {models}} = server
        return models.User.bulkCreate([
          { login: 'user1', homeFloor: 1, avatarUrl: 'http://user1.com' },
          { login: 'user2', homeFloor: 2, avatarUrl: 'http://user2.com' }
        ])
      })
  })

  after(() => {
    return stop(server)
  })

  it('should get users', () => {
    return runQuery(server, `{
      users {
        login
        homeFloor
        avatarUrl
      }
    }`)
      .then((result) => {
        const {body: {data: {users}, errors}} = result
        expect(errors).to.equal(undefined)
        expect(users).to.eql([
          { login: 'user1', homeFloor: 1, avatarUrl: 'http://user1.com' },
          { login: 'user2', homeFloor: 2, avatarUrl: 'http://user2.com' }
        ])
      })
  })
})
