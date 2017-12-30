const {TransactionError, ValidationError} = require('../errors')
const {Op} = require('sequelize')

module.exports = {
  // User
  createUser (root, { input }, {sequelize: {User}}) {
    return User.create(input)
  },

  updateUser (root, { input }, {sequelize: {User}}) {
    return User.findById(input.id)
      .then(user => {
        return user.update(input)
      })
  },

  removeUser (root, { input: {id} }, {sequelize: {User}}) {
    return User.findById(id)
      .then(user => user.destroy())
  },

  // Room
  createRoom (root, { input }, {sequelize: {Room}}) {
    return Room.create(input)
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
    if (dateEnd.getTime() < dateStart.getTime()) {
      throw new ValidationError({
        data: {
          dateStart: 'dateStart should be earlier that dateEnd'
        }
      })
    }
    return Room.findById(roomId)
      .then((room) => {
        if (!room) {
          throw new TransactionError({
            data: {
              roomId: `Room with id "${roomId}" was not found`
            }
          })
        }
      })
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
    return Event.findById(id)
      .then(event => {
        return event.update(input)
      })
  },

  removeUserFromEvent (root, { id, userId }, {sequelize: {Event}}) {
    return Event.findById(id)
      .then(event => {
        event.removeUser(userId)
        return event
      })
  },

  changeEventRoom (root, { id, roomId }, {sequelize: {Event}}) {
    return Event.findById(id)
      .then(event => {
        event.setRoom(id)
      })
  },

  removeEvent (root, { id }, {sequelize: {Event}}) {
    return Event.findById(id)
      .then(event => event.destroy())
  }
}
