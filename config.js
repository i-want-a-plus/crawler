module.exports = {
  domain: 'https://courses.illinois.edu/',
  db: {
    dialect: 'sqlite',
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    storage: 'db.sqlite',
    logging: false,
    define: {
      underscored: false
    }
  },
  endpoint: 'http://localhost:8080'
};




