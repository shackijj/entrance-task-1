const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('#removeEvent', () => {
  let server
  let roomId
  let eventId

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
    return runQuery(server, `mutation {
      createRoom(input: {
        title: "Zoo",
        capacity: 5,
        floor: 2
      }) {
        id
      }
    }`)
      .then(({body: {data: {createRoom: {id}}}}) => {
        roomId = id

        return runQuery(server, `mutation {
          createEvent(input: {
            title: "Foo",
            dateStart: "2017-12-29T06:13:17.304Z",
            dateEnd: "2017-12-29T06:13:18.304Z",
            roomId: "${roomId}"
          }) {
            id
          }
        }`)
          .then(({body: {data: {createEvent: {id}}}}) => {
            eventId = id
          })
      })
  })

  it('should not remove an unexisting event', () => {
    return runQuery(server, `mutation {
      removeEvent(input: {
        id: "Unexpected"
      }) {
        title
      }
    }
    `)
      .then(({body: {data: {removeEvent}, errors}}) => {
        expect(removeEvent).to.equal(null)
        expect(errors.length).to.equal(1)
        expect(errors[0].name).to.equal('TransactionError')
        expect(errors[0].data).to.eql({
          id: `Event with "Unexpected" not found`
        })
      })
  })

  it('should not remove an unexisting event', () => {
    return runQuery(server, `mutation {
      removeEvent(input: {
        id: "${eventId}"
      }) {
        title
      }
    }
    `)
      .then(({body: {data: {removeEvent}, errors}}) => {
        expect(errors).to.equal(undefined)
        expect(removeEvent).to.eql({
          title: 'Foo'
        })
      })
  })
})
