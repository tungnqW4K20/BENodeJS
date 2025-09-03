const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('shopyody_new', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
