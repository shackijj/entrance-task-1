const {TransactionError, ValidationError} = require('../errors')
const {Op} = require('sequelize')

function assertDatesOrder (dateStart, dateEnd) {
  if (dateEnd.getTime() < dateStart.getTime()) {
    throw new ValidationError({
      data: {
        dateStart: 'dateStart should be earlier that dateEnd'
      }
    })
  }
}

function assertTypeFound (model, type, field, id) {
  return model.findById(id)
    .then((result) => {
      if (!result) {
        throw new TransactionError({
          data: {
            [field]: `${type} with id "${id}" not found`
          }
        })
      }
      return result
    })
}

module.exports = {
  // User
  createUser (root, { input }, {sequelize: {User, Floor}}) {
    const { floor } = input
    return assertTypeFound(Floor, 'Floor', 'floor', floor)
      .then((floor) => {
        return User.create(input)
          .then((user) => user.setFloor(floor))
      })
  },

  updateUser (root, { input }, {sequelize: {User, Floor}}) {
    const { id, floor } = input
    return assertTypeFound(User, 'User', 'id', id)
      .then(user => {
        if (floor) {
          return assertTypeFound(Floor, 'Floor', 'floor', floor)
            .then((floor) => {
              return user.setFloor(floor)
            })
        }
        return user
      })
      .then((user) => user.update(input))
  },

  removeUser (root, { input: {id} }, {sequelize: {User}}) {
    return User.findById(id)
      .then(user => user.destroy())
  },

  // Room
  createRoom (root, { input }, {sequelize: {Room, Floor}}) {
    const {floor} = input
    return assertTypeFound(Floor, 'Floor', 'floor', floor)
      .then(() => Room.create(input))
      .then(room => room.setFloor(floor))
  },

  updateRoom (root, { input }, {sequelize: {Room}}) {
    return Room.findById(input.id)
      .then(room => {
        return room.update(input)
      })
  },

  removeRoom (root, {input: {id}}, {sequelize: {Room}}) {
    return Room.findById(id)
      .then(room => room.destroy())
  },

  // Event
  createEvent (root, { input }, {sequelize: {Event, Room, User}}) {
    const {roomId, userIds, dateStart, dateEnd} = input
    assertDatesOrder(dateStart, dateEnd)
    return assertTypeFound(Room, 'Room', 'roomId', roomId)
      .then(() => {
        if (!userIds) {
          return
        }
        return User.findAndCountAll({
          attributes: ['id'],
          where: {
            id: {
              [Op.or]: userIds
            }
          }
        })
          .then((result) => {
            if (result && result.count === userIds.length) {
              return
            }
            throw new TransactionError({
              data: {
                userIds: 'User(s) was not found'
              }
            })
          })
      })
      .then(() => {
        return Event.create(input)
      })
      .then(event => {
        return event.setRoom(roomId)
      })
      .then(event => {
        if (userIds) {
          return event.setUsers(userIds)
            .then(() => {
              return event
            })
        }
        return event
      })
  },

  updateEvent (root, {input}, {sequelize: {Event}}) {
    const {id} = input
    return assertTypeFound(Event, 'Event', 'id', id)
      .then((event) => {
        const updatedEvent = Object.assign(event.get(), input)
        assertDatesOrder(updatedEvent.dateStart, updatedEvent.dateEnd)
        return event.update(updatedEvent)
      })
  },

  removeUserFromEvent (root, {input: {userId, eventId}}, {sequelize: {Event}}) {
    return assertTypeFound(Event, 'Event', 'eventId', eventId)
      .then(event => {
        return event.hasUser(userId)
          .then((result) => {
            if (!result) {
              throw new TransactionError({
                data: {
                  userId: `Event is not associated with user which has id "Unexpected"`
                }
              })
            }
            return event
          })
          .then((event) => {
            return event.removeUser(userId)
          })
          .then((result) => {
            if (result) {
              return event
            }
          })
      })
  },

  addUserToEvent (root, {input: {userId, eventId}}, {sequelize: {Event, User}}) {
    const eventPromise = assertTypeFound(Event, 'Event', 'eventId', eventId)
    const userPromise = assertTypeFound(User, 'User', 'userId', userId)

    return Promise.all([eventPromise, userPromise])
      .then(([event, room]) => {
        return event.addUser(userId)
          .then(() => {
            return event
          })
      })
  },

  changeEventRoom (root, {input: {eventId, roomId}}, {sequelize: {Event, Room}}) {
    const eventPromise = assertTypeFound(Event, 'Event', 'eventId', eventId)
    const roomPromise = assertTypeFound(Room, 'Room', 'roomId', roomId)

    return Promise.all([eventPromise, roomPromise])
      .then(([event, room]) => {
        return event.setRoom(roomId)
      })
  },

  removeEvent (root, {input: {id}}, {sequelize: {Event}}) {
    return assertTypeFound(Event, 'Event', 'id', id)
      .then(event => event.destroy())
  }
}
