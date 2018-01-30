const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('#changeEventRoom', () => {
  let server
  let room1Id
  let room2Id
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
    const room1Promise = runQuery(server, `mutation {
      createRoom(input: {
        title: "Zoo",
        capacity: 5,
        floor: ${floor.id}
      }) {
        id
      }
    }`)
    const room2Promise = runQuery(server, `mutation {
      createRoom(input: {
        title: "Boo",
        capacity: 5,
        floor: ${floor.id}
      }) {
        id
      }
    }`)
    return Promise.all([room1Promise, room2Promise])
      .then(([
        {body: {data: {createRoom: {id: r1id}}}},
        {body: {data: {createRoom: {id: r2id}}}}
      ]) => {
        room1Id = r1id
        room2Id = r2id

        return runQuery(server, `mutation {
          createEvent(input: {
            title: "Foo",
            dateStart: "2017-12-29T06:13:17.304Z",
            dateEnd: "2017-12-29T06:13:18.304Z",
            roomId: "${room1Id}"
          }) {
            id
          }
        }`)
          .then(({body: {data: {createEvent: {id}}}}) => {
            eventId = id
          })
      })
  })

  it('should not set an unxeisting room on an event', () => {
    return runQuery(server, `mutation {
      changeEventRoom(input: {
        eventId: "${eventId}",
        roomId: "Unexpected"
      }) {
        room {
          title
        }
      }
    }`)
      .then(({body: {data: {changeEventRoom}, errors}}) => {
        expect(changeEventRoom).to.equal(null)
        expect(errors.length).to.equal(1)
        expect(errors[0].name).to.equal('TransactionError')
        expect(errors[0].data).to.eql({
          roomId: `Room with id "Unexpected" not found`
        })
      })
  })

  it('should not set a room on an unexistong event', () => {
    return runQuery(server, `mutation {
      changeEventRoom(input: {
        eventId: "Unexpected",
        roomId: "${room1Id}"
      }) {
        room {
          title
        }
      }
    }`)
      .then(({body: {data: {changeEventRoom}, errors}}) => {
        expect(changeEventRoom).to.equal(null)
        expect(errors.length).to.equal(1)
        expect(errors[0].name).to.equal('TransactionError')
        expect(errors[0].data).to.eql({
          eventId: `Event with id "Unexpected" not found`
        })
      })
  })

  it('should set a new room for an event', () => {
    return runQuery(server, `mutation {
      changeEventRoom(input: {
        eventId: "${eventId}",
        roomId: "${room2Id}"
      }) {
        room {
          title
        }
      }
    }`)
      .then(({body: {data: {changeEventRoom}, errors}}) => {
        expect(errors).to.equal(undefined)
        expect(changeEventRoom).to.eql({
          room: {
            title: 'Boo'
          }
        })
      })
  })
})
