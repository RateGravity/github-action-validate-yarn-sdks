const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

const validate = (rootPackageJsonPath, yarnSdkFolderPath) => {
  // Read the dependencies from the root package.json
  const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));

  const findPackageJsonFiles = (folderPath, files) => {
    const fileNames = fs.readdirSync(folderPath);
    fileNames.forEach((fileName) => {
      const filePath = path.join(folderPath, fileName);
      if (fs.statSync(filePath).isDirectory()) {
        findPackageJsonFiles(filePath, files);
      } else if (fileName === 'package.json') {
        files.push(filePath);
      }
    });
  };

  // Find all package.json files under the specified directory
  const sdkPackageJsonFiles = [];
  findPackageJsonFiles(yarnSdkFolderPath, sdkPackageJsonFiles);

  let errors = 0;

  // Iterate over each package.json file and compare the version
  sdkPackageJsonFiles.forEach((file) => {
    const sdkPackageJson = JSON.parse(fs.readFileSync(file, 'utf8'));
    const sdkName = sdkPackageJson.name;
    const sdkVersion = sdkPackageJson.version;

    // Extract only the numeric parts of the versions using regex
    const sdkVersionNumeric = sdkVersion.match(/[0-9]+(\.[0-9]+)*/)[0];

    // Extract the version of the corresponding dependency from the root package.json
    const rootDependencyVersion =
      rootPackageJson.devDependencies[sdkName] || rootPackageJson.dependencies[sdkName];

    if (!rootDependencyVersion) {
      core.warning(
        `Yarn SDK ${file} with version ${sdkVersionNumeric} was not found in root package.json`
      );
      return;
    }

    const rootDependencyVersionNumeric = rootDependencyVersion.match(/[0-9]+(\.[0-9]+)*/)[0];

    if (sdkVersionNumeric !== rootDependencyVersionNumeric) {
      core.error(
        `Yarn SDK version mismatch found in ${file} -- Expected version: ${rootDependencyVersionNumeric}, but found: ${sdkVersionNumeric}`
      );
      errors = 1;
    }
  });

  if (errors === 1) {
    core.setFailed();
    return;
  }

  core.info('All Yarn SDK versions match the corresponding dependencies in the root package.json');
  return;
};

const packageJson = path.resolve(core.getInput('package-json'));
const sdkDirectory = path.resolve(core.getInput('sdk-directory'));

if (!fs.existsSync(packageJson)) {
  throw new Error(`package.json not found at path: ${packageJsonPath}`);
}

if (!fs.existsSync(sdkDirectory)) {
  throw new Error(`SDK directory not found at path: ${sdkDirectory}`);
}

validate(packageJson, sdkDirectory);

module.exports = { validate };
