import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as efs from 'aws-cdk-lib/aws-efs'
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'; 
import { Repository } from 'aws-cdk-lib/aws-ecr';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC with public subnet
    const vpc = new ec2.Vpc(this, 'BadgerBoardVPC', {
      maxAzs: 2, 
      natGateways: 0, 
      subnetConfiguration: [
        {name: 'Public', subnetType: ec2.SubnetType.PUBLIC}
      ]
    }); 

    const fileSystem = new efs.FileSystem(this, "BadgerBoardFS", {
      vpc: vpc, 
      encrypted: true,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.BURSTING, 
      removalPolicy: cdk.RemovalPolicy.DESTROY
    }); 

    // ECS cluster
    const cluster = new ecs.Cluster(this, "BadgerBoardCluster",{
      vpc: vpc
    });
  }
}
