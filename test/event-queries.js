const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('Event queries', () => {
  let server
  let user1
  let user2
  let room
  let event1

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
          { login: 'user1', avatarUrl: 'http://user1.com' },
          { login: 'user2', avatarUrl: 'http://user2.com' }
        ])
          .then(() => {
            return models.User.findAll()
          })
      })
      .then(([u1, u2]) => {
        user1 = u1.get()
        user2 = u2.get()
      })
      .then(() => {
        const {sequelize: {models}} = server
        return models.Room.bulkCreate([
          { title: 'Test', capacity: 2 }
        ])
          .then(() => {
            return models.Room.findAll()
          })
      })
      .then(([r1]) => {
        room = r1.get()
      })
      .then(() => {
        const {sequelize: {models}} = server
        return models.Event.bulkCreate([
          {
            title: 'Event1',
            dateStart: new Date('2018-01-03T05:48:13.043Z'),
            dateEnd: new Date('2018-01-03T06:48:13.043Z')
          },
          {
            title: 'Event2',
            dateStart: new Date('2018-02-03T05:48:13.043Z'),
            dateEnd: new Date('2018-02-03T06:48:13.043Z')
          },
          {
            title: 'Event3',
            dateStart: new Date('2018-02-04T05:48:13.043Z'),
            dateEnd: new Date('2018-02-04T06:48:13.043Z')
          }
        ])
          .then(() => {
            return models.Event.findAll()
          })
      })
      .then((events) => {
        event1 = events[0].get()
        const users = [user1.id, user2.id]
        const promises = events.map((event) => Promise.all([
          event.setRoom(room.id),
          event.setUsers(users)
        ]))

        return Promise.all(promises)
      })
  })

  after(() => {
    return stop(server)
  })

  describe('#event', () => {
    it('should return an event by given id', () => {
      return runQuery(server, `{
        event(id: "${event1.id}") {
          title
          dateStart
          dateEnd
          users {
            login
            avatarUrl
          }
          room {
            title
            capacity
          }
        }
      }`)
        .then(({body: {data: {event}, errors}}) => {
          expect(errors).to.equal(undefined)
          expect(event).to.eql({
            title: 'Event1',
            dateStart: '2018-01-03T05:48:13.043Z',
            dateEnd: '2018-01-03T06:48:13.043Z',
            users: [
              { login: 'user1', avatarUrl: 'http://user1.com' },
              { login: 'user2', avatarUrl: 'http://user2.com' }
            ],
            room: {
              title: 'Test',
              capacity: 2
            }
          })
        })
    })

    describe('#events', () => {
      it('should return an array of events', () => {
        return runQuery(server, `{
          events {
            title
            dateStart
            dateEnd
            users {
              login
              avatarUrl
            }
            room {
              title
              capacity
            }
          }
        }`)
          .then(({body: {data: {events}, errors}}) => {
            expect(errors).to.equal(undefined)
            expect(events).to.eql([
              {
                title: 'Event1',
                dateStart: '2018-01-03T05:48:13.043Z',
                dateEnd: '2018-01-03T06:48:13.043Z',
                users: [
                  { login: 'user1', avatarUrl: 'http://user1.com' },
                  { login: 'user2', avatarUrl: 'http://user2.com' }
                ],
                room: {
                  title: 'Test',
                  capacity: 2
                }
              },
              {
                title: 'Event2',
                dateStart: '2018-02-03T05:48:13.043Z',
                dateEnd: '2018-02-03T06:48:13.043Z',
                users: [
                  { login: 'user1', avatarUrl: 'http://user1.com' },
                  { login: 'user2', avatarUrl: 'http://user2.com' }
                ],
                room: {
                  title: 'Test',
                  capacity: 2
                }
              },
              {
                title: 'Event3',
                dateStart: '2018-02-04T05:48:13.043Z',
                dateEnd: '2018-02-04T06:48:13.043Z',
                users: [
                  { login: 'user1', avatarUrl: 'http://user1.com' },
                  { login: 'user2', avatarUrl: 'http://user2.com' }
                ],
                room: {
                  title: 'Test',
                  capacity: 2
                }
              }
            ])
          })
      })

      it('should return an array of events filtered by dateStart', () => {
        return runQuery(server, `{
          events(
            filter: { onDate: "2018-01-03T13:48:13.043Z" },
            sort: { field: "dateStart", order: ASC }
          ) {
            title
            dateStart
            dateEnd
          }
        }`)
          .then(({body: {data: {events}, errors}}) => {
            expect(errors).to.equal(undefined)
            expect(events).to.eql([
              {
                title: 'Event1',
                dateStart: '2018-01-03T05:48:13.043Z',
                dateEnd: '2018-01-03T06:48:13.043Z'
              }
            ])
          })
      })
    })
  })
})
