const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('Event mutations', () => {
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

  describe('#createEvent', () => {
    it('should fail to parse the dateStart', () => {
      return runQuery(server, `mutation {
        createEvent(input: {
          title: "Foo",
          dateStart: "2017-12-29T03:10:001Z",
          dateEnd: "asd",
          roomId: "Unexpected"
        })
      }`).catch(({error: {errors}}) => {
        expect(errors[0].message).to.equal(
          'Query error: Invalid date')
      })
    })
    it('should fail to parse the dateEnd', () => {
      return runQuery(server, `mutation {
        createEvent(input: {
          title: "Foo",
          dateStart: "asd",
          dateEnd: "2017-12-29T03:10:005Z",
          roomId: "Unexpected"
        })
      }`)
        .catch(({error: {errors}}) => {
          expect(errors[0].message).to.equal(
            'Query error: Invalid date')
        })
    })

    it('should create an event', () => {
      return runQuery(server, `mutation {
        createRoom(input: {
          title: "Foo",
          capacity: 5,
          floor: 2
        }) {
          id
        }
      }`).then(({body: {data: {createRoom: {id}}}}) => {
        return runQuery(server, `mutation {
            createEvent(input: {
              title: "Foo",
              dateStart: "2017-12-29T06:13:17.304Z",
              dateEnd: "2017-12-29T06:13:18.304Z",
              roomId: "${id}"
            }) {
              title
              dateStart
              dateEnd
            }
          }`).then(({body: {data: {createEvent}}}) => {
          expect(createEvent).to.eql({
            title: 'Foo',
            dateStart: '2017-12-29T06:13:17.304Z',
            dateEnd: '2017-12-29T06:13:18.304Z'
          })
        })
      })
    })

    it('should fail to create an event for an unexsistin room', () => {
      return runQuery(server, `mutation {
        createEvent(input: {
          title: "Foo",
          dateStart: "2017-12-29T06:13:17.304Z",
          dateEnd: "2017-12-29T06:13:18.304Z",
          roomId: "Bar"
        }) {
          title
          dateStart
          dateEnd
        }
      }`)
        .then(({body: {errors}}) => {
          expect(errors[0].data).to.eql({
            roomId: 'Room with id "Bar" was not found'
          })
        })
    })
  })
})
