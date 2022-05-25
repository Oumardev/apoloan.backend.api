require('dotenv').config();

module.exports = {
  "development": {
      "username": process.env.USERNAME_DB,
      "password": process.env.PASSWD_DB,
      "database": process.env.DB_NAME,
      "host": process.env.DB_HOST,
      "dialect": "mysql"
  },
  "test": {
    "username": process.env.USERNAME_DB,
    "password": process.env.PASSWD_DB,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.USERNAME_DB,
    "password": process.env.PASSWD_DB,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "mysql"
  }
};