const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('#addUserToEvent', () => {
  let server
  let roomId
  let user1Id
  let user2Id
  let eventId
  let floor
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
          { floor: 1 }
        ])
      })
      .then((floors) => {
        floor = floors[0]
      })
  })

  after(() => {
    return stop(server)
  })

  before(() => {
    const roomPromise = runQuery(server, `mutation {
      createRoom(input: {
        title: "Zoo",
        capacity: 5,
        floor: ${floor.id}
      }) {
        id
      }
    }`)
    const user1Promise = runQuery(server, `mutation {
      createUser(input: {
        login: "User1",
        floor: ${floor.id},
        avatarUrl: "http://foo.bar"
      }) {
        id
      }
    }`)
    const user2Promise = runQuery(server, `mutation {
      createUser(input: {
        login: "User2",
        floor: ${floor.id},
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
            userIds: ["${user1Id}"]
          }) {
            id
          }
        }`)
          .then(({body: {data: {createEvent: {id}}}}) => {
            eventId = id
          })
      })
  })

  it('should add an user to an event', () => {
    return runQuery(server, `mutation {
      addUserToEvent(input: {
        eventId: "${eventId}",
        userId: "${user2Id}",
      }) {
        users {
          login
        }
      }
    }`)
      .then(({body: {data: {addUserToEvent}, errors}}) => {
        expect(errors).to.equal(undefined)
        expect(addUserToEvent.users.length).to.eql(2)
      })
  })

  it('should not add an user to an unexisted event', () => {
    return runQuery(server, `mutation {
      addUserToEvent(input: {
        eventId: "Unexpected",
        userId: "${user2Id}",
      }) {
        users {
          login
        }
      }
    }`)
      .then(({body: {data: {addUserToEvent}, errors}}) => {
        expect(addUserToEvent).to.equal(null)
        expect(errors.length).to.equal(1)
        expect(errors[0].name).to.equal('TransactionError')
        expect(errors[0].data).to.eql({
          eventId: `Event with id "Unexpected" not found`
        })
      })
  })

  it('should not add an unexisting user to an event', () => {
    return runQuery(server, `mutation {
      addUserToEvent(input: {
        eventId: "Unexpected",
        userId: "${user2Id}",
      }) {
        users {
          login
        }
      }
    }`)
      .then(({body: {data: {addUserToEvent}, errors}}) => {
        expect(addUserToEvent).to.equal(null)
        expect(errors.length).to.equal(1)
        expect(errors[0].name).to.equal('TransactionError')
        expect(errors[0].data).to.eql({
          eventId: `Event with id "Unexpected" not found`
        })
      })
  })
})
