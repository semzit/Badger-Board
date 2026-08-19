import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cdk from "aws-cdk-lib/core";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsp from "aws-cdk-lib/aws-ecs-patterns";
import * as elasticache from "aws-cdk-lib/aws-elasticache";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import { CfnOutput, Duration, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface StaticSiteProps {
  domainName: string;
  siteSubDomain: string;
  adminPassword: string;
}

export class InfraStack extends Construct {
  constructor(scope: cdk.Stack, id: string, props: StaticSiteProps) {
    super(scope, id);

    const siteDomain = props.siteSubDomain + "." + props.domainName;

    // Create VPC with public subnet
    const vpc = new ec2.Vpc(this, "BadgerBoardVPC", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [{ name: "Public", subnetType: ec2.SubnetType.PUBLIC }],
    });

    // Redis (ElastiCache) for the backend
    const redisSecurityGroup = new ec2.SecurityGroup(this, "RedisSecurityGroup", {
      vpc,
      description: "Allow Redis access from the backend ECS service",
    });

    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, "RedisSubnetGroup", {
      description: "Subnet group for BadgerBoard Redis",
      subnetIds: vpc.publicSubnets.map((subnet) => subnet.subnetId),
    });

    const redis = new elasticache.CfnCacheCluster(this, "BadgerBoardRedis", {
      engine: "redis",
      cacheNodeType: "cache.t3.micro",
      numCacheNodes: 1,
      port: 6379,
      cacheSubnetGroupName: redisSubnetGroup.ref,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
    });

    // ECS cluster
    const cluster = new ecs.Cluster(this, "BadgerBoardCluster", {
      vpc: vpc,
    });

    const taskDef = new ecs.FargateTaskDefinition(this, "BadgerBoardTaskDef", {
      memoryLimitMiB: 1024,
      cpu: 512,
    });

    const backendContainer = taskDef.addContainer("BackendContainer", {
      image: ecs.ContainerImage.fromAsset("../../apps/api"),
      portMappings: [{ containerPort: 8080 }],
    });

    backendContainer.addEnvironment("FRONTEND_URL", "https://" + siteDomain);
    backendContainer.addEnvironment("REDIS_URL", `redis://${redis.attrRedisEndpointAddress}:6379`);
    backendContainer.addEnvironment("ADMIN_PASSWORD", props.adminPassword);

    const service = new ecsp.ApplicationLoadBalancedFargateService(this, "BadgerBoardService", {
      cluster: cluster,
      taskDefinition: taskDef,
      assignPublicIp: true,
      publicLoadBalancer: true,
    });

    service.targetGroup.configureHealthCheck({
      path: "/api/health",
      port: "8080",
    });

    service.service.connections.allowFrom(service.loadBalancer, ec2.Port.tcp(8080));
    service.service.connections.allowTo(
      redisSecurityGroup,
      ec2.Port.tcp(6379),
      "Allow Redis access",
    );

    const zone = route53.HostedZone.fromLookup(this, "Zone", { domainName: props.domainName });

    new CfnOutput(this, "Site", { value: "https://" + siteDomain });

    // Content bucket
    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: siteDomain,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,

      /**
       * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
       * DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
       */
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: false,
    });

    new CfnOutput(this, "Bucket", { value: siteBucket.bucketName });

    // TLS certificate
    const certificate = new acm.Certificate(this, "SiteCertificate", {
      domainName: siteDomain,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    new CfnOutput(this, "Certificate", { value: certificate.certificateArn });

    const albOrigin = new origins.LoadBalancerV2Origin(service.loadBalancer, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      certificate: certificate,
      defaultRootObject: "index.html",
      domainNames: [siteDomain],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(0),
        },
      ],
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    distribution.addBehavior("/api/*", albOrigin, {
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });

    distribution.addBehavior("/ws*", albOrigin, {
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });

    new CfnOutput(this, "DistributionId", { value: distribution.distributionId });

    new route53.ARecord(this, "SiteAliasRecord", {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      zone,
    });

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [s3deploy.Source.asset("../../apps/frontend/docs")],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}
