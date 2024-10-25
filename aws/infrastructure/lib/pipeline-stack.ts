import * as cdk from 'aws-cdk-lib';
import {CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep, Wave} from 'aws-cdk-lib/pipelines';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import {Construct} from 'constructs';
import { FrontendStack } from './frontend-stack';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as crypto from 'crypto'

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
        primaryOutputDirectory: 'aws/infrastructure/cdk.out',
        commands: [
          'cd aws/infrastructure',
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
      })
    });

    const buildAppWave = pipeline.addWave('BuildApp');
    const buildAppStep = new ShellStep('Build the App', {
      commands: [
        'cd frontend',
        'npm ci',
        'npm run build',
        'npm run test:nowatch',
      ],
      primaryOutputDirectory: 'frontend/build',
    });
    buildAppWave.addPre(buildAppStep);

    const devBucketName = getBucketName('dev', props?.env?.account,
      props?.env?.region)
    const devStageDeployment = pipeline.addStage(
      new CreateAppStage(this, 'dev', {
        env: props?.env,
        bucketName: devBucketName,
      }));
    devStageDeployment.addPost(new CodeBuildStep('Deploy to dev', {
      input: buildAppStep,
      commands: [
        `aws s3 sync . s3://${devBucketName} --delete`,
      ],
      rolePolicyStatements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            's3:ListBucket',
            's3:PutObject',
          ],
          resources: [
            `arn:aws:s3:::${devBucketName}`,
            `arn:aws:s3:::${devBucketName}/*`,
          ],
        }),
      ],
    }));
  }
}

interface CreateAppStageProps extends cdk.StageProps {
  bucketName: string;
}

class CreateAppStage extends cdk.Stage {

  constructor(scope: Construct, id: string, props: CreateAppStageProps) {
    super(scope, id, props);

    new FrontendStack(this, `Frontend`, {bucketName: props.bucketName});
  }
}

function getBucketName(env:string, account?: string, region?: string) {
  if (account && region) {
    const hash = crypto.createHash('md5')
      .update(account)
      .update(region)
      .digest('hex').slice(0, 16);
    return `wordle-app-${env}-${hash}`;
  } else {
    return `wordle-app-${env}`;
  }
}