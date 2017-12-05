const _ = require('lodash');
const fp = require('lodash/fp');
const Promise = require('bluebird');
const argv = require('yargs').argv;
const model = require('./model');
const ProgressBar = require('progress');
const jsonfile = require('jsonfile');
const fetchAndParseCourse = require('./course');
const rp = require('request-promise');
const endpoint = require('./config').endpoint;
const colors = require('colors');

model.Course.findAll({
  attributes: ['year', 'term', 'subject', 'course'],
  where: { year: '2018', term: 'spring' }
}).then((courses) => {
  // courses = [courses[0]];
  console.log('total = ', courses.length);
  return Promise.map(courses, course => {
    let path = _.map([ 'year', 'term', 'subject', 'course' ], k => _.get(course, k));
    console.log('querying', path);
    return fetchAndParseCourse({ path }).then(_course => {
      return rp({
        method: 'POST',
        uri: `${endpoint}/api/data/import_course`,
        qs: _.pick(course, [ 'year', 'term', 'subject', 'course' ]),
        form: { course: JSON.stringify(_course) }
      }).catch(e => { console.log(colors.red('upstream failed for', path)); });
    });
  }, { concurrency: 5 });
});