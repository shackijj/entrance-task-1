const {expect} = require('chai')

const {start, stop, runQuery, clearDatabase} = require('../src/server')

describe('User mutations', () => {
  let server
  let floors

  before(() => {
    return start()
      .then((instace) => {
        server = instace
        return instace
      })
      .then(clearDatabase)
      .then(() => {
        const {sequelize: {models}} = server
        return models.Floor.bulkCreate([
          { floor: 1 },
          { floor: 2 }
        ])
      })
      .then((result) => {
        floors = result
      })
  })

  after(() => {
    return stop(server)
  })

  describe('#createUser', () => {
    it('should create a user.', () => {
      return runQuery(server, `mutation {
        createUser(input: {
            login: "testUser",
            avatarUrl: "http://foo.bar"
            floor: ${floors[0].id}
          }) {
          id
          login
        }
      }`).then(({body: {data: {createUser}, errors}}) => {
        const {login, id} = createUser
        expect(login).to.equal('testUser')
        expect(id).is.a('string')
      })
    })
  })

  describe('#updateUser', () => {
    it('should update a user by given id', () => {
      return runQuery(server, `mutation {
        createUser(input: {
          login: "testUser",
          floor: ${floors[0].id},
          avatarUrl: "http://foo.bar"
        }) {
          id
          login
          floor {
            floor
          }
        }
      }`).then(({body: {data: {createUser: {id, login, floor}}}}) => {
        expect(login).to.equal('testUser')
        expect(floor).to.eql({floor: 1})
        expect(id).is.a('string')

        return runQuery(server, `mutation {
          updateUser(input: {
            id: "${id}",
            login: "FooBar",
            floor: ${floors[1].id},
          }) {
            login
            floor {
              floor
            }
          }
        }`).then(({body: {data: {updateUser}}}) => {
          expect(updateUser).to.eql({
            login: 'FooBar',
            floor: { floor: 2 }
          })
        })
      })
    })
    it('should update only "login" field', () => {
      return runQuery(server, `mutation {
        createUser(input: {
          login: "testUser",
          floor: ${floors[0].id},
          avatarUrl: "http://foo.bar"
        }) {
          id
          login
        }
      }`).then(({body: {data: {createUser: {id, login, floor}}}}) => {
        expect(login).to.equal('testUser')
        expect(id).is.a('string')

        return runQuery(server, `mutation {
          updateUser(input: {
            id: "${id}",
            login: "FooBar",
          }) {
            login
          }
        }`).then(({body: {data: {updateUser}}}) => {
          expect(updateUser).to.eql({
            login: 'FooBar'
          })
        })
      })
    })
  })

  describe('#removeUser', () => {
    it('should remove a user by given id', () => {
      return runQuery(server, `mutation {
        createUser(input: {
          login: "testUser",
          floor: ${floors[0].id}
          avatarUrl: "http://foo.bar"
        }) {
          id
          login
        }
      }`).then(({body: {data: {createUser: {id, login, homeFloor}}}}) => {
        expect(login).to.equal('testUser')
        expect(id).is.a('string')

        return runQuery(server, `mutation {
          removeUser(input: {
            id: "${id}"
          }) {
            login
          }
        }`).then(({body: {data: {removeUser}}}) => {
          expect(removeUser).to.eql({
            login: 'testUser'
          })
        })
      })
    })
  })
})
