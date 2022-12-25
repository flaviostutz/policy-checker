# policyval

This is an authorization evaluator based on the AWS IAM policy style.

AWS IAM is an amazing tool for authorization but unfortunatelly we cannot use it for custom application level authorizations as it is meant to be used only for protecting AWS resources.

You can use Policyval to create your own AWS policy styled authorization layer for your application.

Modules:

- core: library with core functions for evaluating a bunch of policies and checking if a certain action is allowed
- todo-example: a complete Lambda based example on how to use policyval to protect items in a "todo" application backend

## Usage

```ts
const pol1 = {
    Id: "General access policy",
    Statement: [
        {
            Effect: 'Allow',
            Principal: '*',
            Action: 'todo:view',
            Resource: 'todo:*',
            Condition: {
                'StringEquals': { 
                    'int:ResourceTag/viewer': [ 'admin', 'anyone' ],
                    'int:PrincipalTag/plan': 'basic-pro'
                }
            }
        }
    ]
}

const cpolicyval = compilePolicies([pol1, pol2]);
const allowed = cpolicyval.evaluate({
    Principal: { 'jwt': 'charles', Tags: { 'plan': 'basic-pro' } },
    Action: 'todo:view',
    Resource: { Urn: 'todo:axy576', Tags: { 'viewer': 'anyone' } }
});

```
