# github-action-validate-yarn-sdks

A simple script that will recursively examine all SDKs in your `.yarn/sdks` folder and ensure the package versions match what's in your `package.json` file. Useful for ensuring your dependencies don't drift in your git repo, which can cause issues with IDE tooling.

## Usage

```yml

jobs:
  ...
  ValidateYarnSDKs:
    - steps:
        - name: Checking out repository
          uses: actions/checkout@v3
        ...
        - name: Validate Yarn SDKs
          uses: RateGravity/github-action-validate-yarn-sdks@latest
          with:
            package-json: package.json
            sdk-directory: .yarn/sdks
```
