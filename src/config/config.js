
require('dotenv').config();
module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'shopyody_new',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql'
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'cloth_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
};

// {
//     "development": {
//       "username": "root",
//       "password": "123456",
//       "database": "shopyody_new",
//       "host": "localhost",
//       "dialect": "mysql"
//     },
//     "test": {
//       "username": "root",
//       "password": "123456",
//       "database": "cloth_test",
//       "host": "localhost",
//       "dialect": "mysql"
//     },
//     "production": {
//       "username": "root",
//       "password": "123456",
//       "database": "shopyody_new",
//       "host": "localhost",
//       "dialect": "mysql",
//       "logging": false
//     }
//   }
  