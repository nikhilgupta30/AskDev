if (process.env.NODE_ENV === 'production') {
  module.exports = require('./githubKeys_prod');
} else {
  module.exports = require('./githubKeys_dev');
}
