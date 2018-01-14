const Sequelize = require('sequelize')
const scheme = require('./models')

const DB_NAME = 'meeting-rooms'
const DB_USER = 'admin'
const DB_PASSWORD = 'password'

module.exports = () => {
  const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    dialect: 'sqlite',
    storage: './db.sqlite3',
    operatorsAliases: { $and: Sequelize.Op.and },
    logging: false
  })

  scheme(sequelize)

  return sequelize.sync().then(() => {
    return Promise.resolve(sequelize)
  }, (err) => {
    console.log('Sync error', err)
  })
}
