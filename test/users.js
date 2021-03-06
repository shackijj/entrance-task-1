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
          { firstName: 'Джон', secondName: 'Дон', login: 'user1', avatarUrl: 'http://user1.com' },
          { firstName: 'Клон', secondName: 'Дон', login: 'user2', avatarUrl: 'http://user2.com' }
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
        avatarUrl
      }
    }`)
      .then((result) => {
        const {body: {data: {users}, errors}} = result
        expect(errors).to.equal(undefined)
        expect(users).to.eql([
          { login: 'user1', avatarUrl: 'http://user1.com' },
          { login: 'user2', avatarUrl: 'http://user2.com' }
        ])
      })
  })

  it('should get users containing ', () => {
    return runQuery(server, `{
      users(filter: "Джон") {
        login
        avatarUrl
      }
    }`)
      .then((result) => {
        const {body: {data: {users}, errors}} = result
        expect(errors).to.equal(undefined)
        expect(users).to.eql([
          { login: 'user1', avatarUrl: 'http://user1.com' }
        ])
      })
  })
})
