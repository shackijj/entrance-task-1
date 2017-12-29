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
  })
})
