// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface CdkAwsLambdaPowertoolsInjectorProps {
  // Define construct properties here
}

export class CdkAwsLambdaPowertoolsInjector extends Construct {

  constructor(scope: Construct, id: string, props: CdkAwsLambdaPowertoolsInjectorProps = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkAwsLambdaPowertoolsInjectorQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
