import path from 'path';
import fs from 'fs';
import ejs from 'ejs';

module.exports = function() {};

// The loaders are called from right to left.
module.exports.pitch = function() {
  // Makes the loader asyn.
  const callback = this.async();
  const templatePath = path.join(__dirname, './runtimeTemplate.js');

  // Make this loader cacheable.
  this.cacheable();
  // Explicit the cache dependency.
  this.addDependency(templatePath);

  fs.readFile(templatePath, 'utf-8', (err, template) => {
    if (err) {
      callback(err);
      return;
    }

    const options = JSON.parse(this.query.slice(1));
    const output = ejs.render(template, options);
    callback(null, output);
  });
};
