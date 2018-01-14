module.exports = {
  event (root, { id }, {sequelize: {Event}}) {
    return Event.findById(id)
  },
  events (root, args, {sequelize: {Event}}) {
    return Event.findAll(args)
  },
  user (root, { id }, {sequelize: {User}}) {
    return User.findById(id)
  },
  users (root, args, {sequelize: {User}}) {
    return User.findAll()
  },
  room (root, { id }, {sequelize: {Room}}) {
    return Room.findById(id)
  },
  rooms (root, args, {sequelize: {Room}}) {
    return Room.findAll()
  }
}
