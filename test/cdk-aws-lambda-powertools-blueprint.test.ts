import { resolve } from "node:path";
import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import {
	Architecture,
	Code,
	type FunctionProps,
	type ILayerVersion,
	Function as LambdaFunction,
	Runtime,
} from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PowertoolsFunctionDefaults } from "../lib/index";

const nodejsFunctionProps: FunctionProps = {
	functionName: "test-function-name",
	runtime: Runtime.NODEJS_22_X,
	code: Code.fromInline(
		"export const handler = () => console.log('Hello, world!');",
	),
	handler: "index.handler",
};

const pythonFunctionProps: FunctionProps = {
	functionName: "test-function-name",
	runtime: Runtime.PYTHON_3_13,
	architecture: Architecture.ARM_64,
	code: Code.fromInline("print('Hello, world!')"),
	handler: "index.default",
};

describe("PowertoolsFunctionDefaults", () => {
	describe("Given the Stack has a Function construct", () => {
		it("should not return any bundling options", () => {
			const app = new App();
			const stack = new Stack(app, "TestStack");
			new LambdaFunction(stack, "TestFunction", nodejsFunctionProps);

			const injector = new PowertoolsFunctionDefaults();

			const newProps = injector.inject(nodejsFunctionProps, {
				scope: stack,
				id: "TestFunction",
			});

			expect(newProps).not.toHaveProperty("bundling");
		});

		describe("Given the Function has a Node JS runtime", () => {
			describe("Given the latest version of the module is required", () => {
				const app = new App({
					propertyInjectors: [new PowertoolsFunctionDefaults()],
				});

				const stack = new Stack(app, "TestStack");

				new LambdaFunction(stack, "TestFunction", nodejsFunctionProps);

				const template = Template.fromStack(stack);

				it("should add the Powertools Lambda Layer to the Function", () => {
					const layer = stack.node.tryFindChild(
						"TestFunction-PowertoolsLayer",
					) as ILayerVersion;

					template.hasParameter("*", {
						Type: "AWS::SSM::Parameter::Value<String>",
						Default: "/aws/service/powertools/typescript/generic/all/latest",
					});

					template.hasResourceProperties("AWS::Lambda::Function", {
						Layers: [stack.resolve(layer.layerVersionArn)],
					});
				});

				it("should configure the POWERTOOLS_SERVICE_NAME to be the function name", () => {
					template.hasResourceProperties("AWS::Lambda::Function", {
						Environment: {
							Variables: {
								POWERTOOLS_SERVICE_NAME: nodejsFunctionProps.functionName,
							},
						},
					});
				});

				describe("Given the POWERTOOLS_SERVICE_NAME has been set", () => {
					const app = new App({
						propertyInjectors: [new PowertoolsFunctionDefaults()],
					});

					const stack = new Stack(app, "TestStack");

					const functionName = "some-other-service-name";

					new LambdaFunction(stack, "TestFunction", {
						...nodejsFunctionProps,
						environment: {
							POWERTOOLS_SERVICE_NAME: functionName,
						},
					});

					const template = Template.fromStack(stack);

					it("should not override the POWERTOOLS_SERVICE_NAME", () => {
						template.hasResourceProperties("AWS::Lambda::Function", {
							Environment: {
								Variables: {
									POWERTOOLS_SERVICE_NAME: functionName,
								},
							},
						});
					});
				});
			});

			describe("Given a specific version of the module is required", () => {
				const app = new App({
					propertyInjectors: [
						new PowertoolsFunctionDefaults({
							powertoolsVersion: "2.0.0",
						}),
					],
				});

				const stack = new Stack(app, "TestStack");

				new LambdaFunction(stack, "TestFunction", nodejsFunctionProps);

				const template = Template.fromStack(stack);

				it("should add the Powertools Lambda Layer to the Function", () => {
					const layer = stack.node.tryFindChild(
						"TestFunction-PowertoolsLayer",
					) as ILayerVersion;

					template.hasParameter("*", {
						Type: "AWS::SSM::Parameter::Value<String>",
						Default: "/aws/service/powertools/typescript/generic/all/2.0.0",
					});

					template.hasResourceProperties("AWS::Lambda::Function", {
						Layers: [stack.resolve(layer.layerVersionArn)],
					});
				});
			});
		});

		describe("Given the Function has a Python runtime", () => {
			it("should add the Powertools Lambda Layer to the Function", () => {
				const app = new App({
					propertyInjectors: [new PowertoolsFunctionDefaults()],
				});

				const stack = new Stack(app, "TestStack");

				new LambdaFunction(stack, "TestFunction", pythonFunctionProps);

				const template = Template.fromStack(stack);

				const layer = stack.node.tryFindChild(
					"TestFunction-PowertoolsLayer",
				) as ILayerVersion;

				template.hasParameter("*", {
					Type: "AWS::SSM::Parameter::Value<String>",
					Default: "/aws/service/powertools/python/arm64/python3.13/latest",
				});

				template.hasResourceProperties("AWS::Lambda::Function", {
					Layers: [stack.resolve(layer.layerVersionArn)],
				});
			});

			it("should use the amd64 layer by default", () => {
				const app = new App({
					propertyInjectors: [new PowertoolsFunctionDefaults()],
				});

				const stack = new Stack(app, "TestStack");

				new LambdaFunction(stack, "TestFunction", {
					...pythonFunctionProps,
					architecture: undefined,
				});

				const template = Template.fromStack(stack);

				const layer = stack.node.tryFindChild(
					"TestFunction-PowertoolsLayer",
				) as ILayerVersion;

				template.hasParameter("*", {
					Type: "AWS::SSM::Parameter::Value<String>",
					Default: "/aws/service/powertools/python/x86_64/python3.13/latest",
				});

				template.hasResourceProperties("AWS::Lambda::Function", {
					Layers: [stack.resolve(layer.layerVersionArn)],
				});
			});

			it("should configure the POWERTOOLS_SERVICE_NAME to be the function name", () => {
				const app = new App({
					propertyInjectors: [new PowertoolsFunctionDefaults()],
				});

				const stack = new Stack(app, "TestStack");

				new LambdaFunction(stack, "TestFunction", pythonFunctionProps);

				const template = Template.fromStack(stack);

				template.hasResourceProperties("AWS::Lambda::Function", {
					Environment: {
						Variables: {
							POWERTOOLS_SERVICE_NAME: pythonFunctionProps.functionName,
						},
					},
				});
			});

			describe("Given the POWERTOOLS_SERVICE_NAME has been set", () => {
				const app = new App({
					propertyInjectors: [new PowertoolsFunctionDefaults()],
				});

				const stack = new Stack(app, "TestStack");

				const functionName = "some-other-service-name";

				new LambdaFunction(stack, "TestFunction", {
					...pythonFunctionProps,
					environment: {
						POWERTOOLS_SERVICE_NAME: functionName,
					},
				});

				const template = Template.fromStack(stack);

				it("should not override the POWERTOOLS_SERVICE_NAME", () => {
					template.hasResourceProperties("AWS::Lambda::Function", {
						Environment: {
							Variables: {
								POWERTOOLS_SERVICE_NAME: functionName,
							},
						},
					});
				});
			});
		});

		describe.each([
			Runtime.DOTNET_9,
			Runtime.JAVA_21,
			Runtime.RUBY_3_4,
		])("Given the Function has a %s runtime", (runtime) => {
			const defaultFunctionProps: FunctionProps = {
				functionName: "test-function-name",
				runtime,
				code: Code.fromAsset(resolve(__dirname, "./functionCode")),
				handler: "index.default",
			};

			const app = new App({
				propertyInjectors: [new PowertoolsFunctionDefaults()],
			});

			const stack = new Stack(app, "TestStack");

			new LambdaFunction(stack, "TestFunction", defaultFunctionProps);

			const template = Template.fromStack(stack);

			it("should not create a Powertools Layer", () => {
				const layer = stack.node.tryFindChild(
					"TestFunction-PowertoolsLayer",
				) as ILayerVersion;

				expect(layer).toBeUndefined();
			});

			it("should configure the POWERTOOLS_SERVICE_NAME to be the function name", () => {
				template.hasResourceProperties("AWS::Lambda::Function", {
					Environment: {
						Variables: {
							POWERTOOLS_SERVICE_NAME: defaultFunctionProps.functionName,
						},
					},
				});
			});
		});
	});

	describe("Given the Stack has a NodejsFunction construct", () => {
		it("should return externalModules in the bundling options", () => {
			const app = new App();
			const stack = new Stack(app, "TestStack");
			new NodejsFunction(stack, "TestFunction", nodejsFunctionProps);

			const injector = new PowertoolsFunctionDefaults();

			const newProps = injector.inject(nodejsFunctionProps, {
				scope: stack,
				id: "TestFunction",
			});

			expect(newProps).toMatchObject({
				bundling: {
					externalModules: ["@aws-sdk/*", "@aws-lambda-powertools/*"],
				},
			});
		});

		describe("Given the latest version of the module is required", () => {
			const app = new App({
				propertyInjectors: [new PowertoolsFunctionDefaults()],
			});

			const stack = new Stack(app, "TestStack");

			new NodejsFunction(stack, "TestFunction", nodejsFunctionProps);

			const template = Template.fromStack(stack);

			it("should add the Powertools Lambda Layer to the Function", () => {
				const layer = stack.node.tryFindChild(
					"TestFunction-PowertoolsLayer",
				) as ILayerVersion;

				template.hasParameter("*", {
					Type: "AWS::SSM::Parameter::Value<String>",
					Default: "/aws/service/powertools/typescript/generic/all/latest",
				});

				template.hasResourceProperties("AWS::Lambda::Function", {
					Layers: [stack.resolve(layer.layerVersionArn)],
				});
			});

			it("should configure the POWERTOOLS_SERVICE_NAME to be the function name", () => {
				template.hasResourceProperties("AWS::Lambda::Function", {
					Environment: {
						Variables: {
							POWERTOOLS_SERVICE_NAME: nodejsFunctionProps.functionName,
						},
					},
				});
			});
		});

		describe("Given a specific version of the module is required", () => {
			const app = new App({
				propertyInjectors: [
					new PowertoolsFunctionDefaults({
						powertoolsVersion: "2.0.0",
					}),
				],
			});

			const stack = new Stack(app, "TestStack");

			new NodejsFunction(stack, "TestFunction", nodejsFunctionProps);

			const template = Template.fromStack(stack);

			it("should add the Powertools Lambda Layer to the Function", () => {
				const layer = stack.node.tryFindChild(
					"TestFunction-PowertoolsLayer",
				) as ILayerVersion;

				template.hasParameter("*", {
					Type: "AWS::SSM::Parameter::Value<String>",
					Default: "/aws/service/powertools/typescript/generic/all/2.0.0",
				});

				template.hasResourceProperties("AWS::Lambda::Function", {
					Layers: [stack.resolve(layer.layerVersionArn)],
				});
			});

			it("should configure the POWERTOOLS_SERVICE_NAME to be the function name", () => {
				template.hasResourceProperties("AWS::Lambda::Function", {
					Environment: {
						Variables: {
							POWERTOOLS_SERVICE_NAME: nodejsFunctionProps.functionName,
						},
					},
				});
			});
		});
	});
});
