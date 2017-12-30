const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('#user', () => {
  let server
  let user1

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
          { login: 'user1', homeFloor: 1, avatarUrl: 'http://user1.com' }
        ])
          .then(() => {
            return models.User.findAll()
          })
      })
      .then(([u1]) => {
        user1 = u1.get()
      })
  })

  after(() => {
    return stop(server)
  })

  it('should get a user by id', () => {
    return runQuery(server, `{
      user(id: "${user1.id}") {
        login
        homeFloor
        avatarUrl
      }
    }`)
      .then(({body: {data: {user}, errors}}) => {
        expect(errors).to.equal(undefined)
        expect(user).to.eql({ login: 'user1', homeFloor: 1, avatarUrl: 'http://user1.com' })
      })
  })

  it('should not get a user by wrong id', () => {
    return runQuery(server, `{
      user(id: "Unknown") {
        login
        homeFloor
        avatarUrl
      }
    }`)
      .then(({body: {data: {user}, errors}}) => {
        expect(errors).to.equal(undefined)
        expect(user).to.eql(null)
      })
  })
})
