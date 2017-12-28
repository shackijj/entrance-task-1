const {expect} = require('chai')

const {start, stop, runQuery, clearDatabase} = require('../src/server')

describe('Rooms mutations', () => {
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

  describe('#createRoom', () => {
    it('should create a room', () => {
      return runQuery(server, `mutation {
        createRoom(input: {
          title: "Foo",
          capacity: 5,
          floor: 2
        }) {
          title
          capacity
          floor
          id
        }
      }`).then(({body: {data: {createRoom: {title, capacity, floor, id}}}}) => {
        expect(id).to.be.a('string')
        expect(capacity).to.equal(5)
        expect(floor).to.equal(2)
        expect(title).to.equal('Foo')
      })
    })
  })

  describe('#updateRoom', () => {
    it('should update a room by given id', () => {
      return runQuery(server, `mutation {
        createRoom(input: {
          title: "Foo",
          capacity: 5,
          floor: 2
        }) {
          title
          capacity
          floor
          id
        }
      }`).then(({body: {data: {createRoom: {title, capacity, floor, id}}}}) => {
        expect(id).to.be.a('string')
        expect(capacity).to.equal(5)
        expect(floor).to.equal(2)
        expect(title).to.equal('Foo')

        return runQuery(server, `mutation {
          updateRoom(id: ${id}, input: {
            title: "Bar",
            capacity: 2,
            floor: 3
          }) {
            title
            capacity
            floor
          }
        }`).then(({body: {data: {updateRoom: {title, capacity, floor}}}}) => {
          expect(capacity).to.equal(2)
          expect(floor).to.equal(3)
          expect(title).to.equal('Bar')
        })
      })
    })
  })

  describe('#removeRoom', () => {
    it('should remove a room by given id', () => {
      let expected
      return runQuery(server, `mutation {
        createRoom(input: {
          title: "Foo",
          capacity: 5,
          floor: 2
        }) {
          id
        }
      }`).then(({body: {data: {createRoom: {id}}}}) => {
        expected = id
        expect(id).to.be.a('string')

        return runQuery(server, `mutation {
          removeRoom(id: "${id}") {
            id
          }
        }`).then(({body: {data: {removeRoom: {id}}}}) => {
          expect(id).to.equal(expected)
        })
      })
    })
  })
})
