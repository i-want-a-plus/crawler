const _ = require('lodash');
const fp = require('lodash/fp');
const Promise = require('bluebird');
const argv = require('yargs').argv;
var model = require('./model');
const ProgressBar = require('progress');
const jsonfile = require('jsonfile');

const fetchAndParseSection = require('./section');

model.Course.findAll({
  attributes: ['year', 'term', 'subject', 'course'],
  where: { year: '2018', term: 'spring' }
}).then((sections) => {
  console.log('total = ', sections.length);

  return Promise.map(sections, section => {
    let path = _.map([ 'year', 'term', 'subject', 'course' ], k => _.get(section, k));
    console.log('querying', path);
    return fetchAndParseSection({ path });
  }, { concurrency: 5 });
});