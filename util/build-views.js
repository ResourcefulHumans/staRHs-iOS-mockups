'use strict'

var Promise = require('bluebird')
Promise.promisifyAll(require('fs'))

var glob = require('glob'),
  fs = require('fs'),
  _ = require('lodash'),
  config = require('../package.json')

var argv = require('yargs')
  .usage('Usage: $0 -s [source] -t [target]')
  .demand(['s', 't'])
  .alias('s', 'source')
  .alias('t', 'target')
  .help('h')
  .alias('h', 'help')
  .argv


function run() {

  var templatedata = {
    version: +new Date(),
    tag: config.version,
    name: config.name,
    description: config.description
  }

  var includes = {}
  var directives = {}

  console.log()
  console.log('Building template files …')
  console.log(' data:')
  _.map(templatedata, function (value, key) {
    console.log('  ' + key + ': ' + value)
  })

  // Build includes
  var globAsync = Promise.promisify(glob)
  return globAsync(argv.s + 'includes/*.html')
    .then(function (includeTemplates) {
      return Promise.map(includeTemplates, function (file) {
        return fs.readFileAsync(file, 'utf8').then(function (data) {
          var trg = file.replace(argv.s + 'includes/', '')
          trg = trg.replace(/\.html$/, '')
          trg = trg.replace(/\//, '.')
          data = _.template(data)({data: templatedata})
          includes[trg] = data
        })
      })
    })
    .then(function () {
      return globAsync(argv.s + '/*.html')
        .map(function (src) {
          return fs.readFileAsync(src, 'utf8').then(function (data) {
            data = _.template(data)({
              data: templatedata,
              includes: includes,
              directives: directives,
              page: {
                filename: src
              }
            })
            var trg = argv.t + '/' + src.replace(argv.s + '/', '')
            console.log(src + ' -> ' + trg)
            return fs.writeFileAsync(trg, data)
          })
        })
    })
}

return run().then(function () {
  process.exit(0)
}).catch(function (err) {
  console.error(err)
  process.exit(1)
})
