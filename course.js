const _ = require('lodash');
const fp = require('lodash/fp');
const Promise = require('bluebird');
const rp = require('request-promise');
const cheerio = require('cheerio');
const { composeUri } = require('./util');
const argv = require('yargs').argv;

let parsers = {
  status: (v) => cheerio.load(v)('span').first().text(),
  type: (v) => v,
  section: (v) => String(cheerio.load(v).text()).substring(0,3),
  time: (v) => {
    var reg = /\d{2}:\d{2}[A-Z]{2}\s-\s\d{2}:\d{2}[A-Z]{2}/gmi;
    return _.uniq(String(cheerio.load(v)('div').text()).match(reg));
  },
  day: (v) => {
    var reg = /[A-Z]+/gmi;
    return _.uniq(String(cheerio.load(v).text()).match(reg));
  },
  location: (v) => {
    var locations = [];
    $ = cheerio.load(v);
    $('div').each(function (i, elem) {
      locations.push($(this).text());
    });
    return locations;
  },
  instructor: (v) => {
    var reg = /[A-Z][a-z]*,\s[A-Z]/gm;
    return _.uniq(String(cheerio.load(v).text()).match(reg));
  }
};

module.exports = fetchAndParseCourse = ({ path }) => {
  var options = {
      uri: composeUri([ 'schedule', ...path ]),
      transform: function (body) {
          return { $: cheerio.load(body), body };
      }
  };

  return rp(options).then(({ $, body }) => {
    let course = {};

    let couseString = String($('.app-inline').text());
    course.subject = couseString.substring(0, couseString.indexOf(' '));
    course.course = couseString.substring(couseString.indexOf(' ') + 1);
    course.title = $('.app-label.app-text-engage').text();
    course.gened = [];

    $('.list-unstyled.sort-list li').each(function () {
      course.gened.push($(this).text());
    });

    course.sections = [];
    try {
      $('script').each((idx, el) => {
        let c = $(el).html();
        if (c.indexOf('sectionDataObj') != -1) {
          course.sections = eval('(function(){' + c + ';return sectionDataObj;})()');
        }
      });
    } catch (e) {};

    course.sections = _.map(course.sections, section => _.pick(_.mapValues(section, (v, k, o) => {
      if (_.has(parsers, k)) return parsers[k](v); else return v;
    }), [ 'status', 'crn', 'section', 'time', 'day', 'location', 'instructor' ]));

    return course;
  });
};

if (require.main === module) {
  return fetchAndParseCourse({
    path: _.split(argv.path, /,\//g)
  }).then(data => { console.log(data); });
}