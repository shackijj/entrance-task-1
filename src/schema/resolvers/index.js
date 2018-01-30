const GraphQLDate = require('graphql-date')

const query = require('./query')
const mutation = require('./mutation')

const onDateFilter = require('../../utils/onDateFilter')

module.exports = function resolvers () {
  return {
    Query: query,

    Mutation: mutation,

    Room: {
      events ({id}, {filter, sort}, {sequelize: {Event}}) {
        let where = {}
        let order = []
        if (filter && filter.onDate) {
          where.dateStart = onDateFilter(filter.onDate)
        }
        if (sort && sort.field && sort.order) {
          order.push([sort.field, sort.order])
        }
        return Event.findAll({
          where: {
            roomId: id,
            ...where
          },
          order
        })
      },
      floor (room) {
        return room.getFloor()
      }
    },

    Floor: {
      rooms ({id}, _, {sequelize: {Room}}) {
        return Room.findAll({
          where: {
            floorId: id
          }
        })
      }
    },

    User: {
      floor (user) {
        return user.getFloor()
      }
    },

    Event: {
      users (event) {
        return event.getUsers()
      },
      room (event) {
        return event.getRoom()
      }
    },

    Date: GraphQLDate
  }
}
