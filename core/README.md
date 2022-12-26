# policyval core

This is an authorization evaluator library based on the AWS IAM policy style.

## Usage example

- `npm install --save @policyval/core`

```ts
import { compilePolicies } from '@policyval/core';

const pol1 = {
  Id: 'General access policy',
  Statement: [
    {
      Effect: 'Allow',
      Principal: '*',
      Action: 'todo:view',
      Resource: 'todo/*',
      Condition: {
        StringEquals: {
          'int:ResourceTag/viewer': ['public', 'anyone'],
          'int:PrincipalTag/plan': 'basic-pro',
        },
      },
    },
    {
      Effect: 'Allow',
      Principal: '*',
      Action: 'todo:*',
      Resource: 'todo/*',
      Condition: {
        StringEquals: {
          'int:ResourceTag/owner': 'int:PrincipalTag/userid',
        },
      },
    },
  ],
};

const pol2 = {
  Id: 'Specific items policy',
  Statement: [
    {
      Effect: 'Allow',
      Principal: { jwt: ['flaviostutz'] },
      Action: ['todo:update', 'todo:delete'],
      Resource: ['todo/abc123', 'todo/xyz123'],
      Condition: {
        DateGreaterThan: { 'int:CurrentTime': '2020-04-01T00:00:00Z' },
        DateLessThan: { 'int:CurrentTime': '2020-06-30T23:59:59Z' },
      },
    },
  ],
};

const cpolicyval = compilePolicies([pol1, pol2]);

//returns false because we are in 2022 and the policy that would give this access is expired
const allowed1 = cpolicyval.evaluate({
  Principal: { jwt: 'flaviostutz' },
  Action: 'todo:update',
  Resource: { Urn: 'todo:abc123' },
});

//returns true because richard has plan 'basic-pro'
const allowed2 = cpolicyval.evaluate({
  Principal: { jwt: 'richard', Tags: [{ plan: 'basic-pro' }] },
  Action: 'todo:view',
  Resource: 'todo:axy576',
});

//returns true because charles is the 'owner' of the resource
const allowed3 = cpolicyval.evaluate({
  Principal: { jwt: 'charles', Tags: { userid: 'charles' } },
  Action: 'todo:delete',
  Resource: { Urn: 'todo:axy123', Tags: { owner: 'charles' } },
});
```

## Reference

### Rule evaluation

- Policies related to principal, action and resource are selected
- Each policy is evaluated
  - variables are resolved
  - conditions are evaluated
- If no policy matches the evaluation, Deny takes effect
- If multiple rules have conflicting Allow and Deny effects as its result, Deny is returned

```ts
const policy = {
  Id: 'Specific items policy',
  Statement: [
    {
      Effect: 'Allow',
      Principal: { jwt: ['flaviostutz'] },
      Action: ['todo:update', 'todo:delete'],
      Resource: ['todo/abc123', 'todo/xyz123'],
    },
  ],
};
```

### Conditions

We support all the condition operators listed at https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html, including "IfExists"

Variable resolutions are supported also as "ctx:ResourceTag/[tagName]", for resource tag resolutions, "ctx:PrincipalTag/[tagName]", for principal tag resolutions, "ctx:CurrentTime" and "ctx:EpochTime" (note that we changed from "aws" to "ctx").

Resource variable substitutions is supported also, for example

```ts
{
  Resource: "tasks/${ctx:PrincipalTag/area, 'all'}/*"
}
```

### Functions

- **core.compilePolicies(policies[])**

  - Returns a evaluator for a set of policy documents
  - In general, policy document follows general guidelines from https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html, excluding specific AWS elements
  - The elements supported are: Id, Statement, Effect, Principal, Action and Resource (Condition in the future)

- **evaluator.evaluate(input)**

  - Evaluates the context with Principal, Resource and Action against the set of policies set on compilePolicies and return a boolean, indicating "allowed" or "disallowed".

  - _input_ is:

```ts
{
    Principal: { jwt: 'richard', Tags: [ { plan: 'basic-pro' } ] },
    Action: 'todo:view',
    Resource: 'todo:axy576'
}
```

- Arrays are not allowed here because you are specifying the specific context for authorization.
