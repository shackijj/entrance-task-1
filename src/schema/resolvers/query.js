const { DEFAULT_ORDER } = require('../../constants')
const onDateFilter = require('../../utils/onDateFilter')
const { Op } = require('sequelize')

module.exports = {
  event (root, { id }, {sequelize: {Event}}) {
    return Event.findById(id)
  },
  events (root, {filter}, {sequelize: {Event}}) {
    const where = {}
    if (filter && filter.onDate) {
      where.dateStart = onDateFilter(filter.onDate)
    }
    return Event.findAll({
      where
    })
  },
  user (root, { id }, {sequelize: {User}}) {
    return User.findById(id)
  },
  users (root, {filter}, {sequelize: {User}}) {
    let where = {}
    if (filter) {
      const like = `%${filter}%`
      where.$or = [
        {
          firstName: {
            [Op.like]: like
          }
        },
        {
          secondName: {
            [Op.like]: like
          }
        }
      ]
    }
    return User.findAll({ where })
  },
  room (root, { id }, {sequelize: {Room}}) {
    return Room.findById(id)
  },
  rooms (root, args, {sequelize: {Room}}) {
    return Room.findAll()
  },
  floors (root, {order = DEFAULT_ORDER}, {sequelize: {Floor}}) {
    return Floor.findAll({
      order: [
        ['floor', order]
      ]
    })
  }
}
