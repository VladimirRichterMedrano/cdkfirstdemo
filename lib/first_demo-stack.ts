import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import { SubnetType, AmazonLinuxImage, NatInstanceImage, SecurityGroup, NatProvider } from '@aws-cdk/aws-ec2';
import { Tag } from '@aws-cdk/core';

export class FirstDemoStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const natGatewayProvider = ec2.NatProvider.instance({
      instanceType: new ec2.InstanceType('t3.micro'),
      keyName: 'Ubuntu-KP'
    });
    
    /*
    * VPC
    */
    const vpc = new ec2.Vpc(this, 'DEV_VPC', {
      cidr: '10.0.0.0/26',
      maxAzs: 1,
      subnetConfiguration:[
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: 'NAT',
          cidrMask: 28
        },
        {
          subnetType: ec2.SubnetType.PRIVATE,
          name: 'WEB',
          cidrMask: 28
        }
      ],
      natGatewayProvider,
      natGateways:1,
    });
    Tag.add(vpc, 'Name', 'Development VPC');

    /*
    * NAT Security Group
    */
    const natSecurityGroup = new ec2.SecurityGroup(this, 'nat_securityGroup', {
      vpc: vpc,
      securityGroupName: 'NatSecurityGroup',
      description: 'Nat instance Security Group',
      allowAllOutbound: true
    })

    natSecurityGroup.addIngressRule(
      ec2.Peer.ipv4('186.121.202.130/32'),
      ec2.Port.tcp(22),
      'Allow ssh access from Processmaker La Paz Office'
    );

    natSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow Http access from the world'
    )

    natSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow Http access from the world'
    );

    /*
    * WEB Security Group
    */
    const webSecurityGroup = new ec2.SecurityGroup(this, 'web_securityGroup', {
      vpc: vpc,
      securityGroupName: 'WebSecurityGroup',
      description: 'Web instance Security Group',
      allowAllOutbound: true
    })

    webSecurityGroup.connections.allowFrom(natSecurityGroup, ec2.Port.allTraffic(), 'Allow tcp traffic for NAT Security Group');
    /*webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4().connections(SecurityGroup('nat_securityGroup')),
      ec2.Port.allTraffic(),
      'Allow tcp traffic for NAT Security Group',
      true
    );*/

    /*
    * WEB Instamce
    */
    const webInstance = new ec2.Instance(this, 'web_instance', {
      instanceType: new ec2.InstanceType('t3.micro'),
      vpc: vpc,
      machineImage: new AmazonLinuxImage(),
      instanceName: 'WEB Instance Test',
      keyName: 'Ubuntu-KP',
      securityGroup: webSecurityGroup,
      vpcSubnets: {subnetName: 'WEB'}
    });

    /*
    * NAT Instamce
    */
    const natInstance = new ec2.Instance(this, 'nat_instance',{
      instanceType: new ec2.InstanceType('t3.micro'),
      vpc: vpc,
      machineImage: new NatInstanceImage(),
      instanceName: 'NAT Instance Test',
      keyName: 'Ubuntu-KP',
      securityGroup: natSecurityGroup,
      vpcSubnets: {subnetName: 'NAT'}
    })
  }
}
