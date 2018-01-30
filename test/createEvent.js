const {start, stop, runQuery, clearDatabase} = require('../src/server')
const {expect} = require('chai')

describe('#createEvent', () => {
  let server
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

  it('should fail to parse the dateStart', () => {
    return runQuery(server, `mutation {
      createEvent(input: {
        title: "Foo",
        dateStart: "2017-12-29T06:13:17.304Z",
        dateEnd: "asd",
        roomId: "Unexpected"
      })
    }`).catch(({error: {errors}, statusCode}) => {
      expect(statusCode).to.equal(400)
      expect(errors.length).to.equal(2)
      expect(errors[1].data.originalMessage).to.equal(
        'Expected type Date!, found "asd"; Query error: Invalid date')
    })
  })
  it('should fail to parse the dateEnd', () => {
    return runQuery(server, `mutation {
      createEvent(input: {
        title: "Foo",
        dateStart: "2017-12-29T06:13:17.304Z",
        dateEnd: "asd",
        roomId: "Unexpected"
      })
    }`)
      .catch(({error: {errors}, statusCode}) => {
        expect(statusCode).to.equal(400)
        expect(errors.length).to.equal(2)
        expect(errors[1].data.originalMessage).to.equal(
          'Expected type Date!, found "asd"; Query error: Invalid date')
      })
  })

  it('should create an event', () => {
    return runQuery(server, `mutation {
      createRoom(input: {
        title: "Foo",
        capacity: 5,
        floor: ${floor.id}
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
            room {
              title,
              floor {
                floor
              },
              capacity
            }
          }
        }`).then(({body: {data: {createEvent}}}) => {
        expect(createEvent).to.eql({
          title: 'Foo',
          dateStart: '2017-12-29T06:13:17.304Z',
          dateEnd: '2017-12-29T06:13:18.304Z',
          room: {
            title: 'Foo',
            capacity: 5,
            floor: {floor: 1}
          }
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
        expect(errors[0].name).to.eql(
          'TransactionError')
        expect(errors[0].message).to.eql(
          'An error has occured during transaction')
        expect(errors[0].data).to.eql({
          roomId: 'Room with id "Bar" not found'
        })
      })
  })

  it('should fail to create an event if dateEnd is earlier than dateEnd', () => {
    return runQuery(server, `mutation {
      createRoom(input: {
        title: "Foo",
        capacity: 5,
        floor: ${floor.id}
      }) {
        id
      }
    }`).then(({body: {data: {createRoom: {id}}}}) => {
      return runQuery(server, `mutation {
        createEvent(input: {
          title: "Foo",
          dateStart: "2017-12-29T06:20:17.304Z",
          dateEnd: "2017-12-29T06:10:18.304Z",
          roomId: ${id}
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
  })

  it('should fail to create an event with wrong userIds', () => {
    const roomPromise = runQuery(server, `mutation {
      createRoom(input: {
        title: "Zoo",
        capacity: 5,
        floor: ${floor.id}
      }) {
        id
      }
    }`)
    const userPromise = runQuery(server, `mutation {
      createUser(input: {
        login: "FooBar",
        floor: ${floor.id}
        avatarUrl: "http://foo.bar"
      }) {
        id
      }
    }`)
    return Promise.all([roomPromise, userPromise])
      .then(([
        {body: {data: {createRoom: {id: roomId}}}},
        {body: {data: {createUser: {id: userId}}}}
      ]) => {
        return runQuery(server, `mutation {
            createEvent(input: {
              title: "Foo",
              dateStart: "2017-12-29T06:13:17.304Z",
              dateEnd: "2017-12-29T06:13:18.304Z",
              roomId: "${roomId}"
              userIds: [${userId}, "Unexpected"]
            }) {
              title
              users {
                login
              }
            }
          }`)
          .then(({body: {errors}}) => {
            expect(errors[0].name).to.eql(
              'TransactionError')
            expect(errors[0].message).to.eql(
              'An error has occured during transaction')
            expect(errors[0].data).to.eql({
              userIds: 'User(s) was not found'
            })
          })
      })
  })
  it('should create an event with users', () => {
    const roomPromise = runQuery(server, `mutation {
      createRoom(input: {
        title: "Zoo",
        capacity: 5,
        floor: ${floor.id}
      }) {
        id
      }
    }`)
    const userPromise = runQuery(server, `mutation {
      createUser(input: {
        login: "FooBar",
        floor: ${floor.id}
        avatarUrl: "http://foo.bar"
      }) {
        id
      }
    }`)
    return Promise.all([roomPromise, userPromise])
      .then(([
        {body: {data: {createRoom: {id: roomId}}}},
        {body: {data: {createUser: {id: userId}}}}
      ]) => {
        return runQuery(server, `mutation {
            createEvent(input: {
              title: "Foo",
              dateStart: "2017-12-29T06:13:17.304Z",
              dateEnd: "2017-12-29T06:13:18.304Z",
              roomId: "${roomId}"
              userIds: [${userId}]
            }) {
              title
              users {
                login
              }
            }
          }`)
          .then(({body: {data: {createEvent}}}) => {
            expect(createEvent).to.eql({
              title: 'Foo',
              users: [
                {
                  login: 'FooBar'
                }
              ]
            })
          })
      })
  })
})
