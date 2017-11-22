const _ = require('lodash');
const fp = require('lodash/fp');
const Promise = require('bluebird');
const rp = require('request-promise');
const cheerio = require('cheerio');
const { composeUri } = require('./util');
const ProgressBar = require('progress');
const jsonfile = require('jsonfile');
const argv = require('yargs').argv

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

let processor = (queue, data = {}, cb) => {
  let o = queue.shift();

  totalRequestCount ++;
  bar.total = queue.length + totalRequestCount;
  bar.curr = totalRequestCount;
  bar.render();

  if (!o) return cb(data);

  rp(option({ uri: composeUri(o) })).then($ => {
    let l = $(`tbody td a`).map(function () { return $(this).attr('href'); }).get();
    _.each(l, o => _.set(data, o.replace('/schedule/', '').replace(/\//g, '.'), {}));
    if (_.includes(selectors, $(`table`).attr('id'))) {
      queue = _.concat(queue, l);
    }
    processor(queue, data, cb);
  });
};

module.exports = processorPromise = (a1, a2) => new Promise(resolve => processor(a1, a2, resolve));

if (require.main === module) {
  console.log(`save to [${argv.file}]`);
  processorPromise([ 'schedule/' + (argv.endpoint || '') ])
    .then(data => jsonfile.writeFile(argv.file, data)).then(() => {
      console.log('\nfinished');
    });
}
