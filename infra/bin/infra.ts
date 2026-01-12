#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/infra-stack';


/**
 * This stack relies on getting the domain name from CDK context.
 * Use 'cdk synth -c domain=mystaticsite.com -c subdomain=www'
 * Or add the following to cdk.json:
 * {
 *   "context": {
 *     "domain": "mystaticsite.com",
 *     "subdomain": "www",
 *     "accountId": "1234567890",
 *   }
 * }
**/
class MyInfraStack extends cdk.Stack{
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
        super(parent, name, props);

        new InfraStack(this, 'InfraStack', {
            domainName: this.node.tryGetContext('domain'),
            siteSubDomain: this.node.tryGetContext('subdomain'),
        });
    }
}


const app = new cdk.App();
new MyInfraStack(app, 'MyInfraStack', {
    /**
     * This is required for our use of hosted-zone lookup.
     *
     * Lookups do not work at all without an explicit environment
     * specified; to use them, you must specify env.
     * @see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
     */
    env: {
        account: "609196769908",
        /**
         * Stack must be in us-east-1, because the ACM certificate for a
         * global CloudFront distribution must be requested in us-east-1.
         */
        region: 'us-east-1',
    }
});
