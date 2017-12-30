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
              room {
                title,
                floor,
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
              floor: 2
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
            roomId: 'Room with id "Bar" was not found'
          })
        })
    })

    it('should fail to create an event if dateEnd is earlier than dateEnd', () => {
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
          floor: 2
        }) {
          id
        }
      }`)
      const userPromise = runQuery(server, `mutation {
        createUser(input: {
          login: "FooBar",
          homeFloor: 2,
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
          floor: 2
        }) {
          id
        }
      }`)
      const userPromise = runQuery(server, `mutation {
        createUser(input: {
          login: "FooBar",
          homeFloor: 2,
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

  describe('#updateEvent', () => {
    let roomId
    let userId
    let eventId
    before(() => {
      const roomPromise = runQuery(server, `mutation {
        createRoom(input: {
          title: "Zoo",
          capacity: 5,
          floor: 2
        }) {
          id
        }
      }`)
      const user1Promise = runQuery(server, `mutation {
        createUser(input: {
          login: "User1",
          homeFloor: 2,
        }) {
          id
        }
      }`)
      return Promise.all([roomPromise, user1Promise])
        .then(([
          {body: {data: {createRoom: {id}}}},
          {body: {data: {createUser: {id: uId}}}}
        ]) => {
          roomId = id
          userId = uId

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
            id: `Event with "Baz" not found`
          })
        })
    })
  })

  describe('#removeUserFromEvent', () => {
    let roomId
    let user1Id
    let user2Id
    let eventId
    before(() => {
      const roomPromise = runQuery(server, `mutation {
        createRoom(input: {
          title: "Zoo",
          capacity: 5,
          floor: 2
        }) {
          id
        }
      }`)
      const user1Promise = runQuery(server, `mutation {
        createUser(input: {
          login: "User1",
          homeFloor: 2,
        }) {
          id
        }
      }`)
      const user2Promise = runQuery(server, `mutation {
        createUser(input: {
          login: "User2",
          homeFloor: 2,
        }) {
          id
        }
      }`)
      return Promise.all([roomPromise, user1Promise, user2Promise])
        .then(([
          {body: {data: {createRoom: {id}}}},
          {body: {data: {createUser: {id: u1Id}}}},
          {body: {data: {createUser: {id: u2Id}}}}
        ]) => {
          roomId = id
          user1Id = u1Id
          user2Id = u2Id

          return runQuery(server, `mutation {
            createEvent(input: {
              title: "Foo",
              dateStart: "2017-12-29T06:13:17.304Z",
              dateEnd: "2017-12-29T06:13:18.304Z",
              roomId: "${roomId}"
              userIds: ["${user1Id}", "${user2Id}"]
            }) {
              id
            }
          }`)
            .then(({body: {data: {createEvent: {id}}}}) => {
              eventId = id
            })
        })
    })

    it('should remove given user from an event', () => {
      return runQuery(server, `mutation {
        removeUserFromEvent(input: {
          eventId: "${eventId}",
          userId: "${user1Id}"
        }) {
          users {
            login
          }
        }
      }`)
        .then(({body: {data: {removeUserFromEvent}}}) => {
          expect(removeUserFromEvent).to.eql({
            users: [
              {
                login: 'User2'
              }
            ]
          })
        })
    })

    it('should fail to remove unbound user from an event', () => {
      return runQuery(server, `mutation {
        removeUserFromEvent(input: {
          eventId: "${eventId}",
          userId: "Unexpected"
        }) {
          users {
            login
          }
        }
      }`)
        .then(({body: {data: {removeUserFromEvent}, errors}}) => {
          expect(removeUserFromEvent).to.equal(null)
          expect(errors.length).to.equal(1)
          expect(errors[0].name).to.equal('TransactionError')
          expect(errors[0].data).to.eql({
            userId: `Event is not associated with user which has id "Unexpected"`
          })
        })
    })
  })

  describe('#addUserToEvent', () => {
    let roomId
    let user1Id
    let user2Id
    let eventId
    before(() => {
      const roomPromise = runQuery(server, `mutation {
        createRoom(input: {
          title: "Zoo",
          capacity: 5,
          floor: 2
        }) {
          id
        }
      }`)
      const user1Promise = runQuery(server, `mutation {
        createUser(input: {
          login: "User1",
          homeFloor: 2,
        }) {
          id
        }
      }`)
      const user2Promise = runQuery(server, `mutation {
        createUser(input: {
          login: "User2",
          homeFloor: 2,
        }) {
          id
        }
      }`)
      return Promise.all([roomPromise, user1Promise, user2Promise])
        .then(([
          {body: {data: {createRoom: {id}}}},
          {body: {data: {createUser: {id: u1Id}}}},
          {body: {data: {createUser: {id: u2Id}}}}
        ]) => {
          roomId = id
          user1Id = u1Id
          user2Id = u2Id

          return runQuery(server, `mutation {
            createEvent(input: {
              title: "Foo",
              dateStart: "2017-12-29T06:13:17.304Z",
              dateEnd: "2017-12-29T06:13:18.304Z",
              roomId: "${roomId}"
              userIds: ["${user1Id}"]
            }) {
              id
            }
          }`)
            .then(({body: {data: {createEvent: {id}}}}) => {
              eventId = id
            })
        })
    })

    it('should add an user to an event', () => {
      return runQuery(server, `mutation {
        addUserToEvent(input: {
          eventId: "${eventId}",
          userId: "${user2Id}",
        }) {
          users {
            login
          }
        }
      }`)
        .then(({body: {data: {addUserToEvent}, errors}}) => {
          expect(errors).to.equal(undefined)
          expect(addUserToEvent).to.eql({
            users: [
              {
                login: 'User1'
              },
              {
                login: 'User2'
              }
            ]
          })
        })
    })

    it('should not add an user to an unexisted event', () => {
      return runQuery(server, `mutation {
        addUserToEvent(input: {
          eventId: "Unexpected",
          userId: "${user2Id}",
        }) {
          users {
            login
          }
        }
      }`)
        .then(({body: {data: {addUserToEvent}, errors}}) => {
          expect(addUserToEvent).to.equal(null)
          expect(errors.length).to.equal(1)
          expect(errors[0].name).to.equal('TransactionError')
          expect(errors[0].data).to.eql({
            eventId: `Event with "Unexpected" not found`
          })
        })
    })

    it('should not add an unexisting user to an event', () => {
      return runQuery(server, `mutation {
        addUserToEvent(input: {
          eventId: "Unexpected",
          userId: "${user2Id}",
        }) {
          users {
            login
          }
        }
      }`)
        .then(({body: {data: {addUserToEvent}, errors}}) => {
          expect(addUserToEvent).to.equal(null)
          expect(errors.length).to.equal(1)
          expect(errors[0].name).to.equal('TransactionError')
          expect(errors[0].data).to.eql({
            eventId: `Event with "Unexpected" not found`
          })
        })
    })
  })

  describe('#changeEventRoom', () => {
    let room1Id
    let room2Id
    let eventId
    before(() => {
      const room1Promise = runQuery(server, `mutation {
        createRoom(input: {
          title: "Zoo",
          capacity: 5,
          floor: 2
        }) {
          id
        }
      }`)
      const room2Promise = runQuery(server, `mutation {
        createRoom(input: {
          title: "Boo",
          capacity: 5,
          floor: 2
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
            roomId: `Room with "Unexpected" not found`
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
            eventId: `Event with "Unexpected" not found`
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

  describe('#removeEvent', () => {
    let roomId
    let eventId
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
})
