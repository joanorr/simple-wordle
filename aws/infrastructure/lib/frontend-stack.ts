import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import {Construct} from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';

interface FrontendStackProps extends cdk.StackProps {
  bucketName: string;
  domainName: string;
  subdomainName: string;
}

export class FrontendStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.bucketName,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Reference to the pre-existing hosted zone which the API will be bound to
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.domainName,
    });

    // DnsValidatedCertificate is deprecated but it does some useful magic for
    // cross-region certificate creation which Certificate doesn't do. Longer
    // term it would be better to manage certificates in a separate stack and
    // import their ARNs.
    const certificate = new certificatemanager.DnsValidatedCertificate(
      this, 'Cert', {
        domainName: props.domainName,
        hostedZone,
        region: 'us-east-1',
        subjectAlternativeNames: [`${props.subdomainName}.${props.domainName}`],
        validation: {
          method: certificatemanager.ValidationMethod.DNS,
          props: {
            hostedZone: hostedZone,
          }
        }
      });

    const distribution = new cloudfront.Distribution(this, 'CloudFront', {
      certificate,
      defaultRootObject: 'index.html',
      domainNames: [`${props.subdomainName}.${props.domainName}`],
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket, {}),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      }
    });

    // Set up a DNS record pointing to the bucket
    new route53.ARecord(this, 'ARecord', {
      zone: hostedZone,
      recordName: props.subdomainName,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)),
      ttl: cdk.Duration.seconds(30),
    });
  }
}
