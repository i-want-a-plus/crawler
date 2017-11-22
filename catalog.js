const _ = require('lodash');
const fp = require('lodash/fp');
const Promise = require('bluebird');
const rp = require('request-promise');
const cheerio = require('cheerio');
const { composeUri } = require('./util');
const ProgressBar = require('progress');
const jsonfile = require('jsonfile');
const argv = require('yargs').argv

const model = require('./model');

var bar = new ProgressBar('loading [:bar] :percent :current/:total', {
  total: 1,
  width: 30,
  incomplete: ' '
});
var totalRequestCount = 0;

let option = o => _.defaults({
  transform: (body) => cheerio.load(body)
}, o);

let selectors = [
  'years-dt',
  'year-dt',
  'term-dt'
];

let props = [ 'year', 'term', 'subject', 'course' ];

let processor = (queue, data = {}, cb) => {
  let o = queue.shift();

  totalRequestCount ++;
  bar.total = queue.length + totalRequestCount;
  bar.curr = totalRequestCount;
  bar.render();

  if (!o) return cb(data);

  rp(option({ uri: composeUri(o) })).then($ => {
    let l = $(`tbody td a`).map(function () { return $(this).attr('href'); }).get();
    let ks = _.map(l, o => o.replace('/schedule/', '').replace(/\//g, '.'));
    _.each(ks, o => _.set(data, o, {}));
    if (_.includes(selectors, $(`table`).attr('id'))) {
      queue = _.concat(queue, l);
    } else if (argv.db) {
      return Promise.each(
        ks,
        k => {
          return model.Course.findOrCreate({ where: _.zipObject(props, _.split(k, '.')) });
        }
      );
    }
  }).then(() => {
    processor(queue, data, cb);
  });
};

module.exports = processorPromise = (a1, a2) => new Promise(resolve => processor(a1, a2, resolve));

if (require.main === module) {
  console.log(`save to [${argv.file}]`);
  processorPromise([ 'schedule/' + (argv.endpoint || '') ]).then(data => {
    if (argv.file) return jsonfile.writeFile(argv.file, data);
  }).then(() => {
    console.log('\nfinished');
  });
}
