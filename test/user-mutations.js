const {expect} = require('chai')

const {start, stop, runQuery, clearDatabase} = require('../src/server')

describe('User mutations', () => {
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

  describe('#createUser', () => {
    it('should create a user.', () => {
      return runQuery(server, `mutation {
        createUser(input: {login: "testUser"}) {
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
          homeFloor: 3
        }) {
          id
          login
          homeFloor
        }
      }`).then(({body: {data: {createUser: {id, login, homeFloor}}}}) => {
        expect(login).to.equal('testUser')
        expect(homeFloor).to.equal(3)
        expect(id).is.a('string')

        return runQuery(server, `mutation {
          updateUser(id: "${id}", input: {
            login: "FooBar",
            homeFloor: 2,
          }) {
            login
            homeFloor
          }
        }`).then(({body: {data: {updateUser}}}) => {
          expect(updateUser).to.eql({
            login: 'FooBar',
            homeFloor: 2
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
          homeFloor: 3
        }) {
          id
          login
          homeFloor
        }
      }`).then(({body: {data: {createUser: {id, login, homeFloor}}}}) => {
        expect(login).to.equal('testUser')
        expect(homeFloor).to.equal(3)
        expect(id).is.a('string')

        return runQuery(server, `mutation {
          removeUser(id: "${id}") {
            login
            homeFloor
          }
        }`).then(({body: {data: {removeUser}}}) => {
          expect(removeUser).to.eql({
            login: 'testUser',
            homeFloor: 3
          })
        })
      })
    })
  })
})