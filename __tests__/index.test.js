const path = require('path');

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setFailed: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn()
}));

describe('validate-yarn-sdks', () => {
  const packageJsonPath = path.join(__dirname, 'data', 'package.json');
  const sdkFolderPath = path.join(__dirname, 'data', 'sdks');

  const { getInput, setFailed, error, warning, info } = jest.requireMock('@actions/core');

  let validate;

  beforeEach(() => {
    getInput.mockImplementation((input) => {
      switch (input) {
        case 'package-json':
          return packageJsonPath;
        case 'sdk-directory':
          return sdkFolderPath;
        default:
          return undefined;
      }
    });
    validate = require('../index').validate;
    jest.clearAllMocks();
  });

  it('will fail on a version mismatch', () => {
    validate(packageJsonPath, sdkFolderPath);

    expect(setFailed).toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledWith(
      `Yarn SDK version mismatch found in ${path.join(sdkFolderPath, 'test.dependency.bad', 'package.json')} -- Expected version: 1.0.0, but found: 0.9.0`
    );
    expect(error).toHaveBeenCalledWith(
      `Yarn SDK version mismatch found in ${path.join(sdkFolderPath, 'test.dev-dependency.bad', 'package.json')} -- Expected version: 1.0.0, but found: 1.0.1`
    );
  });

  it('will warn on a missing dependency', () => {
    validate(packageJsonPath, sdkFolderPath);

    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      `Yarn SDK ${path.join(sdkFolderPath, 'test.dependency.missing', 'package.json')} with version 1.0.0 was not found in root package.json`
    );
  });

  it('will return on success', () => {
    validate(packageJsonPath, path.join(__dirname, 'data', 'sdks', 'test.dependency.good'));

    expect(setFailed).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(
      'All Yarn SDK versions match the corresponding dependencies in the root package.json'
    );
  });
});
