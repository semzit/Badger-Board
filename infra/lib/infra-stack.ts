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

    // Create load balancer 
    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, "BadgerBoardALB", {
      vpc: vpc, 
      internetFacing: true
    })

    // Create EFS file system and access point 
    const fileSystem = new efs.FileSystem(this, 'BadgerBoards', {
      vpc: vpc,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS, // files are not transitioned to infrequent access (IA) storage by default
      outOfInfrequentAccessPolicy: efs.OutOfInfrequentAccessPolicy.AFTER_1_ACCESS, // files are not transitioned back from (infrequent access) IA to primary storage by default
      replicationOverwriteProtection: efs.ReplicationOverwriteProtection.ENABLED, // Set to `DISABLED` if you want to create a read-only file system for use as a replication destination
      removalPolicy: cdk.RemovalPolicy.DESTROY 
    });

    const accessPointEFS = fileSystem.addAccessPoint("BoardsAccessPoint", {
      path: "/board", 
      createAcl: {
        ownerUid: "1000",
        ownerGid: "1000",
        permissions: "755",
      },
      posixUser: {
        uid: "1000",
        gid: "1000"
      }
    }); 
    
    // ECS cluster
    const cluster = new ecs.Cluster(this, "BadgerBoardCluster",{
      vpc: vpc
    });

    // backend service
    const backendTask = new ecs.FargateTaskDefinition(this, "BackendTask", {
      cpu: 256, 
      memoryLimitMiB: 512, 
    }); 


    fileSystem.grant(backendTask.taskRole, 
      'elasticfilesystem:ClientMount', 
      'elasticfilesystem:ClientWrite',
      'elasticfilesystem:ClientRootAccess' // Required for mounting via Access Points
    );
    

    backendTask.addVolume({
      name: "BadgerBoards", 
      efsVolumeConfiguration: {
        fileSystemId:fileSystem.fileSystemId, 
        transitEncryption: "ENABLED",
        authorizationConfig: {
          accessPointId: accessPointEFS.accessPointId, 
          iam: "ENABLED"
        } ,
      }, 
    }); 

    const backendContainer = backendTask.addContainer("BackendContainer", {
      image: ecs.ContainerImage.fromAsset("../backend"),
      logging: ecs.LogDriver.awsLogs({streamPrefix: "backend"})
    }); 

    backendContainer.addPortMappings(
      {containerPort: 8080},
      {containerPort: 8081}
    );

    backendContainer.addMountPoints({
      containerPath: '/data', 
      sourceVolume: "BadgerBoards", 
      readOnly: false
    })

    backendContainer.addEnvironment("DB_PATH" , "Boards.db"); 

    const backendService =  new ecs.FargateService(this, "backendService", {
      cluster: cluster, 
      taskDefinition: backendTask, 
      assignPublicIp: true
    }); 

    fileSystem.connections.allowDefaultPortFrom(backendService);

    const listener = loadBalancer.addListener("PublicListener", {
      port: 80, 
    })

    // API Routing (/api/* -> 8080)
    listener.addTargets('ApiTarget', {
      priority: 1,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/api/*'])],
      port: 80,
      targets: [backendService.loadBalancerTarget({
        containerName: 'BackendContainer',
        containerPort: 8080,
      })],
      healthCheck: { path: '/api/' } 
    });

    // WS Routing (/ws/* -> 8081)
    listener.addTargets('WsTarget', {
      priority: 2,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/ws/*'])],
      port: 80,
      targets: [backendService.loadBalancerTarget({
        containerName: backendContainer.containerName,
        containerPort: 8081,
      })],
      healthCheck: { 
        path: '/api/',
        port : "8080"  // Hard to deal with WS port for health checks 
      } 
    });

    // Frontend Service 
    const frontendTask = new ecs.FargateTaskDefinition(this, "FrontendTask", {
      cpu : 256, 
      memoryLimitMiB: 512
    }); 

    const frontendContainer = frontendTask.addContainer("FrontendContainer", {
      image: ecs.ContainerImage.fromAsset('../frontend'), 
      logging: ecs.LogDriver.awsLogs({streamPrefix: "backend"})
    });

    frontendContainer.addPortMappings(
      {containerPort: 80}
    ); 
    
    const frontendService = new ecs.FargateService(this, "FrontendService", {
      cluster: cluster, 
      taskDefinition: frontendTask,
      assignPublicIp: true
    })

    listener.addTargets("FrontendTargets", {
      port: 80, 
      targets: [frontendService.loadBalancerTarget({
        containerName: "FrontendContainer", 
        containerPort: 80
      })],
      healthCheck: { path: '/' }
    });

    fileSystem.connections.allowDefaultPortFrom(backendService);
  }
}
