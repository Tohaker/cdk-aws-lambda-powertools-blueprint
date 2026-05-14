---
"cdk-aws-lambda-powertools-blueprint": major
---

Reconfigures the blueprint to use a singleton pattern for all Powertools Lambda Layers. Creates the layers at the stack level, leaving the Lambda Function level alone. 

As this change moves resources around, it is considered a breaking change and may require a redeployment of your infrastructure to cleanly adopt.
