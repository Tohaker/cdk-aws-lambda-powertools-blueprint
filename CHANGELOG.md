# cdk-aws-lambda-powertools-blueprint

## 2.1.0

### Minor Changes

- 38df673: Adds default POWERTOOLS_LOG_LEVEL environment variable to Function constructs. Defaults to INFO, and can be overridden with the logLevel parameter in the Blueprint props, or setting an individual POWERTOOLS_LOG_LEVEL environment variable to the Function construct.

## 2.0.0

### Major Changes

- 104c75f: Reconfigures the blueprint to use a singleton pattern for all Powertools Lambda Layers. Creates the layers at the stack level, leaving the Lambda Function level alone.

  As this change moves resources around, it is considered a breaking change and may require a redeployment of your infrastructure to cleanly adopt.

## 1.0.0

### Major Changes

- 6d47fd6: Adding documentation for first major release

## 0.1.1

### Patch Changes

- 92b06c1: Fixes applying environment variables to NodejsFunction constructs

## 0.1.0

### Minor Changes

- Initial version of library
