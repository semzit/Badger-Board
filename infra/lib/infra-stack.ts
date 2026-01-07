import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as efs from 'aws-cdk-lib/aws-efs'
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
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

    // Create EFS file system and access point 
    const fileSystem = new efs.FileSystem(this, 'BadgerBoards', {
      vpc: vpc,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS, // files are not transitioned to infrequent access (IA) storage by default
      outOfInfrequentAccessPolicy: efs.OutOfInfrequentAccessPolicy.AFTER_1_ACCESS, // files are not transitioned back from (infrequent access) IA to primary storage by default
      replicationOverwriteProtection: efs.ReplicationOverwriteProtection.ENABLED, // Set to `DISABLED` if you want to create a read-only file system for use as a replication destination
      removalPolicy: cdk.RemovalPolicy.DESTROY 
    });

    fileSystem.addAccessPoint("BoardsAccessPoint", {
      path: "/board", 
      posixUser: {
        uid: "1000",
        gid: "1000"
      }
    })
    
    // ECS cluster
    const cluster = new ecs.Cluster(this, "BadgerBoardCluster",{
      vpc: vpc
    })

    // backend service
    const backend = new ecsp.ApplicationMultipleTargetGroupsFargateService(this, "BadgerBoardBackend", {
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset("../../backend"), 
      } 
      
    }); 

    // Connect ECS to task

    // Handle port 8081

    // Frontend Service 


    
  }
}
