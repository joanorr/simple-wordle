import * as cdk from 'aws-cdk-lib';
import {CodePipeline, CodePipelineSource, ShellStep} from 'aws-cdk-lib/pipelines';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import {Construct} from 'constructs';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectionArn = ssm.StringParameter.valueForStringParameter(
      this, '/codeconnections/joanorr/arn');

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'WordlePipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection('joanorr/simple-wordle', 'main', {
          connectionArn
        }),
        commands: [
          'cd aws/infrastructure',
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ]
      })
    });
  }
}