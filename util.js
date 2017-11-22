const _ = require('lodash');
const config = require('./config');

exports.composeUri = composeUri = (list) => {
  if (_.isArray(list)) list = _.join(list, '/');
  return (config.domain + list).replace(/([^:])(\/\/)/g, (m, p1, p2) => p1 + '/');
};