const Sequelize = require('sequelize');
const sequelize = new Sequelize(require('./config').db);

const Course = sequelize.define('Course', {
  year: {
    type: Sequelize.STRING,
    unique: 'courseUnique'
  },
  term: {
    type: Sequelize.STRING,
    unique: 'courseUnique'
  },
  subject: {
    type: Sequelize.STRING,
    unique: 'courseUnique'
  },
  course: {
    type: Sequelize.STRING,
    unique: 'courseUnique'
  }
});

module.exports = {
  Sequelize, sequelize,
  Course
};

if (require.main === module) {
  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
      return sequelize.sync({ force: true })
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
}


