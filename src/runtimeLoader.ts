import * as fs   from 'fs';
import * as path from 'path';

module.exports = function defaultExport() {
    return true;
};

module.exports.pitch = function pitch() {
    const callback = this.async();
    const templatePath = path.join(__dirname, './runtimeTemplate.js');

    this.cacheable();

    this.addDependency(templatePath);

    fs.readFile(templatePath, 'utf-8', (err: any, template: any) => {
        if (err) {
            callback(err);
            return;
        }

        const source = `\n    var serviceWorkerOption = ${this.query.slice(1)};\n${template}\n`
        .trim();

        callback(null, source);
    });
};
