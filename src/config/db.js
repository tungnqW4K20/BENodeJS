// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('shopyody_new', 'root', '123456', {
//   host: 'localhost',
//   dialect: 'mysql'
// });

// module.exports = sequelize;
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
  }
);

module.exports = sequelize;