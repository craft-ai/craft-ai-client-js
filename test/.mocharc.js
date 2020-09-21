module.exports = {
  require: [
    '@babel/register',
    './test/nodejs/helper.js'
  ],
  timeout: 30000, // milli-seconds
  'check-leaks': true,
  bail: true
};
