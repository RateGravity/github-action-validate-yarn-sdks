const path = require('path');

describe('validate-yarn-sdks', () => {
  const packageJsonPath = path.join(__dirname, 'data', 'package.json');
  const sdkFolderPath = path.join(__dirname, 'data', 'sdks');

  const processExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

  let validate;

  beforeEach(() => {
    process.argv = ['node', 'index.js', packageJsonPath, sdkFolderPath];
    validate = require('../index').validate;
    jest.clearAllMocks();
  });

  it('will fail on a version mismatch', () => {
    validate(packageJsonPath, sdkFolderPath);

    expect(processExit).toHaveBeenCalledWith(1);
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenCalledWith(
      `Yarn SDK version mismatch found in ${path.join(sdkFolderPath, 'test.dependency.bad', 'package.json')} -- Expected version: 1.0.0, but found: 0.9.0`
    );
    expect(consoleError).toHaveBeenCalledWith(
      `Yarn SDK version mismatch found in ${path.join(sdkFolderPath, 'test.dev-dependency.bad', 'package.json')} -- Expected version: 1.0.0, but found: 1.0.1`
    );
  });

  it('will warn on a missing dependency', () => {
    validate(packageJsonPath, sdkFolderPath);

    expect(consoleWarn).toHaveBeenCalledTimes(1);
    expect(consoleWarn).toHaveBeenCalledWith(
      `Yarn SDK ${path.join(sdkFolderPath, 'test.dependency.missing', 'package.json')} with version 1.0.0 was not found in root package.json`
    );
  });

  it('will return 0 on success', () => {
    validate(packageJsonPath, path.join(__dirname, 'data', 'sdks', 'test.dependency.good'));

    expect(processExit).toHaveBeenCalledWith(0);
    expect(consoleLog).toHaveBeenCalledTimes(1);
    expect(consoleLog).toHaveBeenCalledWith(
      'All Yarn SDK versions match the corresponding dependencies in the root package.json'
    );
  });
});
