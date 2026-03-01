# CDK AWS Lambda Powertools Blueprint

This [Blueprint](https://docs.aws.amazon.com/cdk/v2/guide/blueprints.html) enables Function constructs defined in your Stack to have all the necessary properties configured to take advantage of [Powertools for AWS Lambda](https://docs.aws.amazon.com/powertools/).

## Benefits

Including the `PowertoolsFunctionDefaults` in your property injectors will apply the following defaults to all Functions in your Stacks.

- The official [Powertools Lambda Layer](https://docs.aws.amazon.com/powertools/typescript/latest/getting-started/lambda-layers/) (only on NodeJS and Python runtimes).
- The POWERTOOLS_SERVICE_NAME environment variable automatically set to the provided `functionName`.

## Usage

Different Lambda Function runtimes will take advantage of different behaviour, demonstrated in each section.

In general, you will just need to add `PowertoolsFunctionDefaults` to your `propertyInjectors`.
You can add it to the `App` instance to cover all your stacks;

```ts
import { App } from "aws-cdk-lib";

import { PowertoolsFunctionDefaults } from "cdk-aws-lambda-powertools-blueprint";

const app = new App({
  propertyInjectors: [new PowertoolsFunctionDefaults()],
});
```

Or you can add it to individual `Stack` instances for more granular control;

```ts
import { App } from "aws-cdk-lib";
import { MyStack } from "../lib/myStack.ts";
import { PowertoolsFunctionDefaults } from "cdk-aws-lambda-powertools-blueprint";

const app = new App();

const stack = new MyStack(app, "MyStack", {
  propertyInjectors: [new PowertoolsFunctionDefaults()],
});
```

### NodeJS Functions

Both `Function` and `NodejsFunction` constructs are supported with the `NODEJS` Runtime Family. If you opt to use the latter, you will also benefit from the `bundling` props being updated to exclude the `@aws-lambda-powertools/*` modules from the final bundle. This will have the benefit of reducing the final bundle size, which can lead to performance improvements.

```ts
import { App } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { PowertoolsFunctionDefaults } from "cdk-aws-lambda-powertools-blueprint";

const app = new App({
  propertyInjectors: [new PowertoolsFunctionDefaults()],
});

const stack = new Stack(app, "MyStack");

const fn = new NodejsFunction(stack, "MyFunction", {
  functionName: "service-my-function",
  runtime: Runtime.NODEJS_22_X,
});
```

You can also select a specific Powertools version if you don't want to use the `latest` version of the Lambda Layer. For example;

```ts
import { App } from "aws-cdk-lib";

import { PowertoolsFunctionDefaults } from "cdk-aws-lambda-powertools-blueprint";

const app = new App({
  propertyInjectors: [
    new PowertoolsFunctionDefaults({
      powertoolsVersion: "2.30.0",
    }),
  ],
});
```

### Python Functions

All `Function` constructs with the `PYTHON` Runtime Family will have the latest [Lambda Layer](https://docs.aws.amazon.com/powertools/python/latest/getting-started/install/#lambda-layer) appropriate to the configured architecture applied. If no `architecture` is applied, the function will fall back to `x86_64` architecture and a warning will be added to your stack annotations.

```ts
import { App } from "aws-cdk-lib";
import { Function, Runtime } from "aws-cdk-lib/aws-lambda";

import { PowertoolsFunctionDefaults } from "cdk-aws-lambda-powertools-blueprint";

const app = new App({
  propertyInjectors: [new PowertoolsFunctionDefaults()],
});

const stack = new Stack(app, "MyStack");

const fn = new Function(stack, "MyFunction", {
  functionName: "service-my-function",
  runtime: Runtime.PYTHON_3_13,
});
```

### All other runtimes

Every Function runtime is supported, but at the time of writing no others have a Lambda Layer to apply to the function. As a result, only the POWERTOOLS_SERVICE_NAME environment variable will be added to any function that is configured with a different runtime than NodeJS or Python.

```ts
import { App } from "aws-cdk-lib";
import { Function, Runtime } from "aws-cdk-lib/aws-lambda";

import { PowertoolsFunctionDefaults } from "cdk-aws-lambda-powertools-blueprint";

const app = new App({
  propertyInjectors: [new PowertoolsFunctionDefaults()],
});

const stack = new Stack(app, "MyStack");

const fn = new Function(stack, "MyFunction", {
  functionName: "service-my-function",
  runtime: Runtime.JAVA_21,
});
```

## Development

If you wish to contribute to this project, please follow the [Contribution guidelines](./CONTRIBUTING.md).

Install dependencies

```sh
npm install
```

Build the package

```sh
npm run build
```

Run unit tests

```sh
npm run test
```

Run linting checks and fix linting issues

```sh
npm run lint
npm run lint:fix
```
