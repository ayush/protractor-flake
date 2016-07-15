export default function (output = '') {
  let match = null
  let CUCUMBERJS_TEST = /^\d+ scenarios?/m
  let failedSpecs = new Set()
  let PROTRACTOR_SHARDED = /------------------------------------/g
  let SPECFILE_REG = /.+Specs:\s(.*\.js)/g
  let WEBDRIVER_ERROR_REG = /WebDriverError/g
  let FAILED_LINES = /at (?:\[object Object\]|Object)\.<anonymous> \((([A-Za-z]:\\)?.*?):.*\)/g

  // Changes here are based off https://github.com/FinKingma/protractor-flake/blob/45a29de19cc08c734f1b900a6944b345df4e5508/src/failed-spec-parser.js
  if (PROTRACTOR_SHARDED.test(output) && SPECFILE_REG.test(output)) {
    console.log('sharded test found')
    let testsOutput = output.split('------------------------------------')
    testsOutput.shift()
    testsOutput.forEach(function (test) {

      // Get name of spec file
      let specfile
      if (match = SPECFILE_REG.exec(test)) {
        specfile = match[1]
      }
      // Yes. You do see this code twice. Not sure why but it is failing the first time sporadically
      if (match = SPECFILE_REG.exec(test)) {
        specfile = match[1]
      }

      // Do we see a stack trace here. Or do we see WebDriverError?
      if(FAILED_LINES.exec(test) || WEBDRIVER_ERROR_REG.exec())
        failedSpecs.add(specfile)

    })
  } else if (CUCUMBERJS_TEST.test(output)) {
    let FAILED_LINES = /(.*?):\d+ # Scenario:.*/g
    while (match = FAILED_LINES.exec(output)) { // eslint-disable-line no-cond-assign
      failedSpecs.add(match[1])
    }
  } else {
    while (match = FAILED_LINES.exec(output)) { // eslint-disable-line no-cond-assign
      // windows output includes stack traces from
      // webdriver so we filter those out here
      if (!/node_modules/.test(match[1])) {
        failedSpecs.add(match[1])
      }
    }
  }

  return [...failedSpecs]
}
