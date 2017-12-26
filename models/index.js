const Sequelize = require('sequelize');

const scheme = require('./scheme');

const Op = Sequelize.Op;

const DB_NAME = 'meeting-rooms';
const DB_USER = 'admin';
const DB_PASSWORD = 'password';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  dialect: 'sqlite',
  storage: 'db.sqlite3',
  operatorsAliases: { $and: Op.and },
  logging: false
});

scheme(sequelize);
sequelize.sync();

module.exports.sequelize = sequelize;
module.exports.models = sequelize.models;
