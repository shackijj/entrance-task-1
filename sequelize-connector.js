const Sequelize = require('sequelize');
const scheme = require('./models/scheme');

const DB_NAME = 'meeting-rooms';
const DB_USER = 'admin';
const DB_PASSWORD = 'password';

module.exports = () => {
    const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        dialect: 'sqlite',
        storage: 'db.sqlite3',
        operatorsAliases: { $and: Sequelize.Op.and },
        logging: false
    });
    return sequelize.sync().then(() => ({
        scheme: scheme(sequelize),
        sequelize
    }));
};
