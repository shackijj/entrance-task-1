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
  createEvent (root, { input, usersIds, roomId }, {sequelize: {Event}}) {
    return Event.create(input)
      .then(event => {
        event.setRoom(roomId)

        return event.setUsers(usersIds)
          .then(() => event)
      })
  },

  updateEvent (root, { id, input }, {sequelize: {Event}}) {
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
