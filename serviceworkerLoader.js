import fs from 'fs';
import loaderUtils from 'loader-utils';

module.exports = function() {};

// The loaders are called from right to left.
module.exports.pitch = function(remainingRequest) {
  // Makes the loader asyn.
  const callback = this.async();

  const options = JSON.parse(this.query.slice(1));

  // Make this loader cacheable.
  this.cacheable();
  // Explicit the cache dependency.
  this.addDependency(options.entry);

  fs.readFile(options.entry, 'utf-8', (err, template) => {
    if (err) {
      callback(err);
      return;
    }

    const ouput = `
      ${template}
      boostrap(${options.data_var_name});
      module.exports = require(${
        loaderUtils.stringifyRequest(this, remainingRequest)
      })
    `.trim();

    callback(null, ouput);
  });
};
