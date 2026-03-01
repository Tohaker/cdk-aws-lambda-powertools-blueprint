import {
	Annotations,
	type InjectionContext,
	type IPropertyInjector,
} from "aws-cdk-lib";
import {
	Architecture,
	type FunctionProps,
	type ILayerVersion,
	Function as LambdaFunction,
	LayerVersion,
	RuntimeFamily,
} from "aws-cdk-lib/aws-lambda";
import {
	NodejsFunction,
	type NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export interface PowertoolsFunctionDefaultsProps {
	/**
	 * The Powertools package version to load into the Lambda.
	 * Only provide this value if you don't want the latest version.
	 *
	 * Setting this field will only have an effect on NodeJS Functions.
	 *
	 * @default "latest"
	 */
	readonly powertoolsVersion?: string;
}

/**
 * Applies Powertools-specific defaults to Functions in your Stack.
 *
 * - If not provided, the POWERTOOLS_SERVICE_NAME environment variable is
 *   set to the `functionName` provided to the function props. If no
 *   `functionName` is set, `service_undefined` is set instead (as per the [Powertools defaults](https://docs.aws.amazon.com/powertools/typescript/latest/features/logger/#utility-settings))
 *
 * For NodeJS and Python Functions, also applies the official Lambda Layer
 * for the appropriate runtime and architecture.
 *
 * NodeJS Functions will also have the '@aws-lambda-powertools/*' modules
 * excluded from being bundled to minimise the bundle size.
 *
 * @see https://docs.aws.amazon.com/powertools/
 */
export class PowertoolsFunctionDefaults implements IPropertyInjector {
	public readonly constructUniqueId: string;

	private powertoolsVersion: string;

	constructor(props?: PowertoolsFunctionDefaultsProps) {
		this.constructUniqueId = LambdaFunction.PROPERTY_INJECTION_ID;

		this.powertoolsVersion = props?.powertoolsVersion ?? "latest";
	}

	// biome-ignore lint/suspicious/noExplicitAny: JSII requires this type to be "any"
	public inject(originalProps: any, context: InjectionContext) {
		const originalFunctionProps: FunctionProps | NodejsFunctionProps =
			originalProps;

		const scope = context.scope as LambdaFunction;

		let powertoolsLayerParameterName = "";

		// Determine if the Function runtime has a layer available
		switch (originalFunctionProps.runtime?.family) {
			case RuntimeFamily.NODEJS: {
				// https://docs.aws.amazon.com/powertools/typescript/latest/getting-started/lambda-layers/#lookup-layer-arn-via-aws-ssm-parameter-store
				powertoolsLayerParameterName = `/aws/service/powertools/typescript/generic/all/${this.powertoolsVersion}`;
				break;
			}
			case RuntimeFamily.PYTHON: {
				const architecture =
					originalFunctionProps.architecture ?? Architecture.X86_64;

				if (!originalFunctionProps.architecture) {
					Annotations.of(scope).addWarningV2(
						"cdk-aws-lambda-powertools-blueprint:Blueprint.missingArchitecture",
						`Function ${context.id} has no specified Architecture and will fall back to ${Architecture.X86_64.name}.`,
					);
				}

				// https://docs.aws.amazon.com/powertools/python/latest/getting-started/install/#using-ssm-parameter-store
				powertoolsLayerParameterName = `/aws/service/powertools/python/${architecture.name}/${originalFunctionProps.runtime.name}/latest`;
				break;
			}
			default: {
				Annotations.of(scope).addInfo(
					`Function ${context.id} is configured with runtime ${originalFunctionProps.runtime} and will not have the Powertools Lambda Layer applied.`,
				);
			}
		}

		let powertoolsLayer: ILayerVersion | undefined;

		const layers = originalFunctionProps.layers ?? [];

		const environment: FunctionProps["environment"] = {
			POWERTOOLS_SERVICE_NAME:
				originalFunctionProps.functionName ?? "service_undefined",
			...originalFunctionProps.environment,
		};

		if (powertoolsLayerParameterName) {
			// Create the LayerVersion construct to apply to the Function
			powertoolsLayer = LayerVersion.fromLayerVersionArn(
				scope,
				`${context.id}-PowertoolsLayer`,
				StringParameter.valueForStringParameter(
					scope,
					powertoolsLayerParameterName,
				),
			);

			// Apply the Powertools layer to the end of the layers array
			layers.push(powertoolsLayer);

			// For NodejsFunction Constructs, we also want to override the bundling to make sure the Lambda bundle is as small as possible
			if (
				context.scope.node.tryFindChild(context.id) instanceof NodejsFunction
			) {
				const originalNodejsProps: NodejsFunctionProps = originalFunctionProps;

				return {
					...originalNodejsProps,
					environment,
					layers,
					bundling: {
						...originalNodejsProps.bundling,
						externalModules: [
							...(originalNodejsProps.bundling?.externalModules ?? []),
							"@aws-sdk/*",
							"@aws-lambda-powertools/*",
						],
					},
				};
			}
		}

		return {
			...originalProps,
			environment,
			layers,
		};
	}
}
