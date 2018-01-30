const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('#updateEvent', () => {
  let roomId
  let userId
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
    const {sequelize: {models}} = server
    const roomsPromise = models.Room.bulkCreate([
      { title: 'Zoo', capacity: 1 }
    ])
    const usersPromise = models.User.bulkCreate([
      { login: 'user1', avatarUrl: 'http://user1.com' }
    ])

    return Promise.all([roomsPromise, usersPromise])
      .then(([rooms, users]) => {
        roomId = rooms[0].id
        userId = users[0].id

        return runQuery(server, `mutation {
          createEvent(input: {
            title: "Foo",
            dateStart: "2017-12-29T06:13:17.304Z",
            dateEnd: "2017-12-29T06:13:18.304Z",
            roomId: "${roomId}"
            userIds: ["${userId}"]
          }) {
            id
          }
        }`)
          .then(({body: {data: {createEvent: {id}}}}) => {
            eventId = id
          })
      })
  })

  it('should update an event by given id', () => {
    return runQuery(server, `mutation {
      updateEvent(input: {
        id: "${eventId}",
        title: "Bar",
        dateStart: "2017-12-30T06:13:17.304Z",
        dateEnd: "2017-12-30T06:13:18.304Z",
      }) {
        title
        dateStart
        dateEnd
      }
    }`)
      .then(({body: {data: {updateEvent}}}) => {
        expect(updateEvent).to.eql({
          title: 'Bar',
          dateStart: '2017-12-30T06:13:17.304Z',
          dateEnd: '2017-12-30T06:13:18.304Z'
        })
      })
  })

  it('should not update an event by with dateEnd earlier that dateStart', () => {
    return runQuery(server, `mutation {
      updateEvent(input: {
        id: "${eventId}",
        title: "Bar",
        dateStart: "2017-12-30T06:13:17.304Z",
        dateEnd: "2016-12-30T06:13:18.304Z",
      }) {
        title
        dateStart
        dateEnd
      }
    }`)
      .then(({body: {errors}}) => {
        expect(errors[0].name).to.eql(
          'ValidationError')
        expect(errors[0].message).to.eql(
          'input data is not valid')
        expect(errors[0].data).to.eql({
          dateStart: 'dateStart should be earlier that dateEnd'
        })
      })
  })

  it('should not update an unexisted event', () => {
    return runQuery(server, `mutation {
      updateEvent(input: {
        id: "Baz",
        title: "Bar",
        dateStart: "2017-12-30T06:13:17.304Z",
        dateEnd: "2016-12-30T06:13:18.304Z",
      }) {
        title
        dateStart
        dateEnd
      }
    }`)
      .then(({body: {errors}}) => {
        expect(errors.length).to.equal(1)
        expect(errors[0].name).to.eql(
          'TransactionError')
        expect(errors[0].data).to.eql({
          id: `Event with id "Baz" not found`
        })
      })
  })
})
