import exec from 'exec-sh';
import fs from 'fs';
import path from 'path';
import * as url from 'url';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));
const childPkg = JSON.parse(fs.readFileSync(new URL('../src/copy/package.json', import.meta.url)));
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function release() {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    year: 'numeric',
    month: 'long',
  });
  const releaseDate = formatter.format(date);

  // Auto-release mode - no interactive prompts
  const options = {
    version: pkg.version,
    alpha: false,
    beta: false,
    next: false,
  };
  // Set version
  pkg.version = options.version;
  childPkg.version = options.version;
  childPkg.releaseDate = releaseDate;
  // Copy dependencies
  childPkg.dependencies = pkg.dependencies;
  fs.writeFileSync(path.resolve(__dirname, '../package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
  fs.writeFileSync(
    path.resolve(__dirname, '../src/copy/package.json'),
    `${JSON.stringify(childPkg, null, 2)}\n`,
  );

  if (options.beta) {
    await exec.promise('cd ./dist && npm publish --tag beta');
  } else if (options.alpha || options.next) {
    await exec.promise('cd ./dist && npm publish --tag next');
  } else {
    await exec.promise('cd ./dist && npm publish');
  }
}
release();
