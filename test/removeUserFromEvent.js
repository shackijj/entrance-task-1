const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('#removeUserFromEvent', () => {
  let roomId
  let user1Id
  let user2Id
  let eventId
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
  before(() => {
    const roomPromise = runQuery(server, `mutation {
      createRoom(input: {
        title: "Zoo",
        capacity: 5,
        floor: 2
      }) {
        id
      }
    }`)
    const user1Promise = runQuery(server, `mutation {
      createUser(input: {
        login: "User1",
        homeFloor: 2,
        avatarUrl: "http://foo.bar"
      }) {
        id
      }
    }`)
    const user2Promise = runQuery(server, `mutation {
      createUser(input: {
        login: "User2",
        homeFloor: 2,
        avatarUrl: "http://foo.bar"
      }) {
        id
      }
    }`)
    return Promise.all([roomPromise, user1Promise, user2Promise])
      .then(([
        {body: {data: {createRoom: {id}}}},
        {body: {data: {createUser: {id: u1Id}}}},
        {body: {data: {createUser: {id: u2Id}}}}
      ]) => {
        roomId = id
        user1Id = u1Id
        user2Id = u2Id

        return runQuery(server, `mutation {
          createEvent(input: {
            title: "Foo",
            dateStart: "2017-12-29T06:13:17.304Z",
            dateEnd: "2017-12-29T06:13:18.304Z",
            roomId: "${roomId}"
            userIds: ["${user1Id}", "${user2Id}"]
          }) {
            id
          }
        }`)
          .then(({body: {data: {createEvent: {id}}}}) => {
            eventId = id
          })
      })
  })

  it('should remove given user from an event', () => {
    return runQuery(server, `mutation {
      removeUserFromEvent(input: {
        eventId: "${eventId}",
        userId: "${user1Id}"
      }) {
        users {
          login
        }
      }
    }`)
      .then(({body: {data: {removeUserFromEvent}}}) => {
        expect(removeUserFromEvent).to.eql({
          users: [
            {
              login: 'User2'
            }
          ]
        })
      })
  })

  it('should fail to remove unbound user from an event', () => {
    return runQuery(server, `mutation {
      removeUserFromEvent(input: {
        eventId: "${eventId}",
        userId: "Unexpected"
      }) {
        users {
          login
        }
      }
    }`)
      .then(({body: {data: {removeUserFromEvent}, errors}}) => {
        expect(removeUserFromEvent).to.equal(null)
        expect(errors.length).to.equal(1)
        expect(errors[0].name).to.equal('TransactionError')
        expect(errors[0].data).to.eql({
          userId: `Event is not associated with user which has id "Unexpected"`
        })
      })
  })
})
