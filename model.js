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

const Section = sequelize.define('Section', {
  year: {
    type: Sequelize.STRING,
    unique: 'sectionUnique'
  },
  term: {
    type: Sequelize.STRING,
    unique: 'sectionUnique'
  },
  subject: {
    type: Sequelize.STRING,
    unique: 'sectionUnique'
  },
  course: {
    type: Sequelize.STRING,
    unique: 'sectionUnique'
  },
  crn: {
    type: Sequelize.STRING,
    unique: 'sectionUnique'
  },
  status: {
    type: Sequelize.INTEGER,
    unique: false
  },
  section: {
    type: Sequelize.STRING,
    unique: false
  },
  time: {
    type: Sequelize.STRING,
    unique: false
  },
  day: {
    type: Sequelize.STRING,
    unique: false
  },
  location: {
    type: Sequelize.STRING,
    unique: false
  },
  instructor: {
    type: Sequelize.STRING,
    unique: false
  }
});

module.exports = {
  Sequelize, sequelize,
  Course, Section
};

Course.Sections = Course.hasMany(Section);

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


