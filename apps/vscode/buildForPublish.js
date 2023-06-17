

const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

function deleteFolderRecursive(pathToDelete) {
  if (fs.existsSync(pathToDelete)) {
    fs.readdirSync(pathToDelete).forEach((file, index) => {
      const curPath = path.join(pathToDelete, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToDelete);
  }
}

async function build() {
  try {
    console.log('Building Extension');
    let {stdout} = await exec('webpack --config extension.webpack.config.ts');
    console.log(stdout);

    console.log('Building Webview');
    let webViewOutput = await exec('webpack --config webview.webpack.config.ts');
    console.log(webViewOutput.stdout);
    console.log('Build complete');
  } catch (err) {
    console.error(`exec error: ${err}`);
  }
}

// Run production build for publishing to the vscode marketplace

// We only want to publish open source builds, not internal ones.
// Fail if we see facebook-only files in the repo.
const internalPath = './facebook/README.facebook.md';
if (fs.existsSync(internalPath)) {
  console.error(
    `${internalPath} exists. Make sure you only publish the vscode extension from the external repo.`,
  );
  process.exit(1);
}

process.env.NODE_ENV = 'production';
console.log('Cleaning dist');
deleteFolderRecursive('./dist');
build();
