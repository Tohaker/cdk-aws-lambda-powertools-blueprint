# Contributing Guidelines

Thank you for your interest in contributing to our project. Whether it's a bug report, new feature, correction, or additional
documentation, we greatly value feedback and contributions from our community.

Please read through this document before submitting any issues or pull requests to ensure we have all the necessary
information to effectively respond to your bug report or contribution.

## Reporting Bugs/Feature Requests

We welcome you to use the GitHub issue tracker to report bugs or suggest features.

When filing an issue, please check existing open, or recently closed, issues to make sure somebody else hasn't already
reported the issue. Please try to include as much information as you can. Details like these are incredibly useful:

- A reproducible test case or series of steps
- The version of our code being used
- Any modifications you've made relevant to the bug
- Anything unusual about your environment or deployment

## Contributing via Pull Requests

### Pull Request Checklist

- [ ] Testing
  - Unit test added (prefer not to modify an existing test, otherwise, it's probably a breaking change)
- [ ] Docs
  - **README**: README updated if necessary
  - **JSDocs**: Inline JSDocs updated if necessary
- [ ] Title and Description
  - **Change type**: title prefixed with **fix**, **feat** and module name in parens, which will appear in changelog
  - **Title**: use lower-case and doesn't end with a period
  - **Breaking?**: last paragraph: "BREAKING CHANGE: <describe what changed + link for details>"
  - **Issues**: Indicate issues fixed via: "**Fixes #xxx**" or "**Closes #xxx**"

Contributions via pull requests are much appreciated. Before sending us a pull request, please ensure that:

1. You are working against the latest source on the _main_ branch.

---

### Step 1: Open Issue

If there isn't one already, open an issue describing what you intend to contribute. It's useful to communicate in advance, because sometimes, someone is already working in this space, so maybe it's worth collaborating with them instead of duplicating the efforts.

### Step 2: Fork the repository

GitHub provides additional document on [forking a repository](https://help.github.com/articles/fork-a-repo/). Make sure you are working against the latest source on the _main_ branch.

### Step 3: Setup

The following tools need to be installed on your system prior to building `cdk-aws-lambda-powertools-blueprint` locally:

- [Node.js >= 22.0.0](https://nodejs.org/download/release/latest-v22.x/)
  - We recommend using a version in [Active LTS](https://nodejs.org/en/about/releases/)

Install dependencies

- `npm install`

### Step 4: Develop

1. Change code
2. If relevant, add [tests](./test/)
3. Run tests
   - `npm run test`
4. Build
   - `npm run build`
5. Update relevant documentation
6. Create the commit with relevant files
7. Create a changeset with `npm run changeset` and commit the generated file

### Step 5: Make the pull request

Send us a [pull request](https://help.github.com/articles/creating-a-pull-request/), answering any default questions in the pull request interface. Pay attention to any automated CI failures reported in the pull request, and stay involved in the conversation.

## Finding contributions to work on

Looking at the existing issues is a great way to find something to contribute on. Looking at any 'help wanted' issues is a great place to start.

## Licensing

See the [LICENSE](./LICENSE) file for the project's licensing.
