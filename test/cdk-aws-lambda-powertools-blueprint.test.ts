import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import {
	Code,
	type FunctionProps,
	type ILayerVersion,
	Function as LambdaFunction,
	Runtime,
} from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PowertoolsFunctionDefaults } from "../lib/index";

const nodejsFunctionProps: FunctionProps = {
	runtime: Runtime.NODEJS_22_X,
	code: Code.fromInline(
		"export const handler = () => console.log('Hello, world!');",
	),
	handler: "index.handler",
};

describe("PowertoolsFunctionDefaults", () => {
	describe("Given the Stack has a Function construct", () => {
		it("should not return any bundling options", () => {
			const app = new App();
			const stack = new Stack(app, "TestStack");
			const fn = new LambdaFunction(stack, "TestFunction", nodejsFunctionProps);

			const injector = new PowertoolsFunctionDefaults();

			const newProps = injector.inject(nodejsFunctionProps, {
				scope: fn,
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
	});

	describe("Given the Stack has a NodejsFunction construct", () => {
		it("should return externalModules in the bundling options", () => {
			const app = new App();
			const stack = new Stack(app, "TestStack");
			const fn = new NodejsFunction(stack, "TestFunction", nodejsFunctionProps);

			const injector = new PowertoolsFunctionDefaults();

			const newProps = injector.inject(nodejsFunctionProps, {
				scope: fn,
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
		});
	});
});
