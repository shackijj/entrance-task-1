const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('Room queries', () => {
  let server
  let room

  before(() => {
    return start()
      .then((instace) => {
        server = instace
        return instace
      })
      .then(clearDatabase)
      .then(() => {
        const {sequelize: {models}} = server
        return models.Room.bulkCreate([
          { title: 'Room1', floor: 1, capacity: 2 },
          { title: 'Room2', floor: 1, capacity: 2 }
        ])
          .then(() => {
            return models.Room.findAll()
          })
      })
      .then(([r1]) => {
        room = r1.get()
      })
  })

  after(() => {
    return stop(server)
  })

  describe('#room', () => {
    it('should return a room by given id', () => {
      return runQuery(server, `{
        room(id: "${room.id}") {
          title
          capacity
          floor
        }
      }`)
        .then(({body: {data: {room}, errors}}) => {
          expect(errors).to.equal(undefined)
          expect(room).to.eql({
            title: 'Room1',
            capacity: 2,
            floor: 1
          })
        })
    })
  })

  describe('#rooms', () => {
    it('should return an array of rooms', () => {
      return runQuery(server, `{
        rooms {
          title
          capacity
          floor
        }
      }`)
        .then(({body: {data: {rooms}, errors}}) => {
          expect(errors).to.equal(undefined)
          expect(rooms).to.eql([
            { title: 'Room1', floor: 1, capacity: 2 },
            { title: 'Room2', floor: 1, capacity: 2 }
          ])
        })
    })
  })
})
