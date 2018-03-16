import fs from 'fs';
import path from 'path';

module.exports = function defaultExport() {
  return true;
};

// The loaders are called from right to left.
module.exports.pitch = function pitch() {
  // Makes the loader asyn.
  const callback = this.async();
  const templatePath = path.join(__dirname, './runtimeTemplate.js');

  // Make this loader cacheable.
  this.cacheable();
  // Explicit the cache dependency.
  this.addDependency(templatePath);

  fs.readFile(templatePath, 'utf-8', (err: any, template: any) => {
    if (err) {
      callback(err);
      return;
    }

    const source = `
      var serviceWorkerOption = ${this.query.slice(1)};
      ${template}
    `.trim();
    callback(null, source);
  });
};
