const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('#floors', () => {
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
        return Promise.all([
          models.Room.bulkCreate([
            { title: 'Room1', capacity: 2 },
            { title: 'Room2', capacity: 2 },
            { title: 'Room3', capacity: 2 }
          ]),
          models.Floor.bulkCreate([
            {
              floor: 1
            },
            {
              floor: 2
            },
            {
              floor: 3
            }
          ]),
          models.Event.bulkCreate([
            {
              title: 'Event1',
              dateStart: new Date('2017-12-29T06:13:17.304Z'),
              dateEnd: new Date('2017-12-29T06:13:17.304Z')
            },
            {
              title: 'Event2',
              dateStart: new Date('2017-12-30T06:13:17.304Z'),
              dateEnd: new Date('2017-12-30T06:13:17.304Z')
            },
            {
              title: 'Event3',
              dateStart: new Date('2017-12-28T08:13:17.304Z'),
              dateEnd: new Date('2017-12-28T09:13:17.304Z')
            },
            {
              title: 'Event4',
              dateStart: new Date('2017-12-28T05:13:17.304Z'),
              dateEnd: new Date('2017-12-28T12:13:17.304Z')
            }
          ])
        ])
      })
      .then(([rooms, floors, events]) => {
        const promises = []
        promises.push(rooms[0].setFloor(floors[0]))
        promises.push(rooms[1].setFloor(floors[1]))
        promises.push(rooms[2].setFloor(floors[2]))
        promises.push(events[0].setRoom(rooms[0]))
        promises.push(events[1].setRoom(rooms[1]))
        promises.push(events[2].setRoom(rooms[2]))
        promises.push(events[3].setRoom(rooms[2]))
        return Promise.all(promises)
      })
  })

  after(() => {
    return stop(server)
  })

  it('should get a list of floors', () => {
    return runQuery(server, `{
      floors(order: ASC) {
        floor
        rooms {
          title
        }
      }
    }`)
      .then((result) => {
        const {body: {data: {floors}, errors}} = result
        expect(errors).to.equal(undefined)
        expect(floors).to.eql([
          {
            floor: 1,
            rooms: [
              {
                title: 'Room1'
              }
            ]
          },
          {
            floor: 2,
            rooms: [
              {
                title: 'Room2'
              }
            ]
          },
          {
            floor: 3,
            rooms: [
              {
                title: 'Room3'
              }
            ]
          }
        ])
      })
  })

  it('should get a list of floors', () => {
    return runQuery(server, `{
      floors(order: DESC) {
        floor
        rooms {
          title
          events {
            title
          }
        }
      }
    }`)
      .then((result) => {
        const {body: {data: {floors}, errors}} = result
        expect(errors).to.equal(undefined)
        expect(floors).to.eql([
          {
            floor: 3,
            rooms: [
              {
                title: 'Room3',
                events: [
                  {
                    title: 'Event3'
                  },
                  {
                    title: 'Event4'
                  }
                ]
              }
            ]
          },
          {
            floor: 2,
            rooms: [
              {
                title: 'Room2',
                events: [
                  {
                    title: 'Event2'
                  }
                ]
              }
            ]
          },
          {
            floor: 1,
            rooms: [
              {
                title: 'Room1',
                events: [
                  {
                    title: 'Event1'
                  }
                ]
              }
            ]
          }
        ])
      })
  })

  it('should get a list of floors with sorted rooms events', () => {
    return runQuery(server, ` {
      floors(order: DESC) {
        floor
        rooms {
          title
          events(filter: {onDate: "2017-12-28T05:13:17.304Z"}, sort: {field: "dateStart", order: ASC}) {
            title
          }
        }
      }
    }`)
      .then((result) => {
        const {body: {data: {floors}, errors}} = result
        expect(errors).to.equal(undefined)
        expect(floors).to.eql([
          {
            floor: 3,
            rooms: [
              {
                title: 'Room3',
                events: [
                  {
                    title: 'Event4'
                  },
                  {
                    title: 'Event3'
                  }
                ]
              }
            ]
          },
          {
            floor: 2,
            rooms: [
              {
                title: 'Room2',
                events: []
              }
            ]
          },
          {
            floor: 1,
            rooms: [
              {
                title: 'Room1',
                events: []
              }
            ]
          }
        ])
      })
  })
})
