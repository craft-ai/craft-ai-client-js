# Changelog #

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/craft-ai/craft-ai-client-js/compare/v1.16.0...HEAD) ##

### Added ###

- Bulk update. The client now contains `createAgentBulk`, `deleteAgentBulk`, `addAgentContextOperationsBulk` and `getAgentDecisionTreeBulk` methods to create, delete, add operations or retrieve trees to several agents at a time.

## [1.16.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.15.4...v1.16.0) - 2019-04-09 ##

### Added ###

- Support timezones as UTC offset in minutes
- Support V2 trees including:
    - Missing values: it is now possible to handle missing values by adding `deactivate_missing_values: false` in the agent configuration. Missing values correspond to a `null` value in a given context.
    - Optional values: it is now possible to handle optional values by adding `is_optional: true` for a property in the agent configuration. Optional values are defined by `{}`, the empty Object, in a given context.
    - The multi-enum operator `ìn`.
    - Boolean values
- Predictions now return the number of samples in the leaf and its distribution if it is a classification problem.
- Predictions now return min and max information for continuous output values.
- For continuous output values, it is now possible to get the mean and standard deviation values from any node in a tree.
- For continuous output values, it is now possible to get the min and max values from any node in a tree.

## [1.15.4](https://github.com/craft-ai/craft-ai-client-js/compare/v1.15.3...v1.15.4) - 2018-11-27 ##

### Changed ###

- `client.getAgentDecisionTree` deals with the retry in a slightly different way, it shouldn't have any impact on the SDK users but improve the occupation of **craft ai** infrastructures.
- `cfg.decisionTreeRetrievalTimeout` increased from 5 minutes to 10 minutes.

## [1.15.3](https://github.com/craft-ai/craft-ai-client-js/compare/v1.15.2...v1.15.3) - 2018-11-13 ##

### Fixed ###

- The conversion from timestamps to time of day is properly rounded. Example: for a timestamp of 1498882800 (01/07/2017 06:20), the time of day is now formatted in '06:20:00' instead of '06:19:59' previously.

## [1.15.2](https://github.com/craft-ai/craft-ai-client-js/compare/v1.15.1...v1.15.2) - 2018-08-07 ##

### Fixed ###

- The `proxy` settings now works properly when set to `undefined`.

### Changed ###

- Updating a bunch of dependencies including `babel`, `dotenv`, `eslint`, `moment`, `node-fetch` and `lodash`.
- `interpreter.formatProperty` is now able to take an instance of `Time`.

## [1.15.1](https://github.com/craft-ai/craft-ai-client-js/compare/v1.15.0...v1.15.1) - 2018-07-26 ##

### Added ###

- Introducing an experimental `proxy` configuration parameter to the client.

### Changed ###

- Discontinuing the continuous testing for Node.js v0.12 due to a SSL certificate issue.

## [1.15.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.14.1...v1.15.0) - 2018-07-16 ##

### Added ###

- Add new function `interpreter.reduceDecisionRules` taking a list of decision rules (as retrieved by `interpreter.decide`) and merging rules that are applied to the same properties.
- Add new function `interpreter.formatDecisionRules` taking a list of decision rules (as retrieved by `interpreter.decide`) and formatting them into a human readable string.
- Add new function `interpreter.formatProperty` formatting a property and its value.

### Changed ###

- Function deprecation notices are now logged only once, using `console.warning`.

## [1.14.1](https://github.com/craft-ai/craft-ai-client-js/compare/v1.14.0...v1.14.1) - 2018-06-06 ##

### Changed ###

- In Node.js environments, all http requests from a client instance share the same [`http(s).Agent`](https://nodejs.org/docs/latest-v8.x/api/http.html#http_class_http_agent) to share TCP connections.

### Fixed ###

- Fixing addContextOperations test.

## [1.14.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.13.0...v1.14.0) - 2018-03-01 ##

### Changed ###

- It is no longer possible to compute a tree at a future timestamp, tests have been adapted to reflect that.

## [1.13.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.12.0...v1.13.0) - 2017-10-30 ##

### Added ###

- `client.getAgentDecisionTree` now transparently retries computation up to the given `cfg.decisionTreeRetrievalTimeout`.

### Fixed ###

- `client.getAgentDecisionTree` now properly returns timeout sent by the API as `errors.CraftAiLongRequestTimeOutError`.

## [1.12.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.11.1...v1.12.0) - 2017-10-24 ##

### Added ###

- Support new format for timezone offsets: +/-hhmm, +/-hh and some abbreviations(CEST, PST, ...). Check the [documentation](https://beta.craft.ai/doc/http#context-properties-types) for the complete list.

### Fixed ###

- Fixing the Typescript signature for `client.getAgentStateHistory`.

## [1.11.1](https://github.com/craft-ai/craft-ai-client-js/compare/v1.11.0...v1.11.1) - 2017-10-13 ##

### Fixed ###
- Fixing the changelog.

## [1.11.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.10.0...v1.11.0) - 2017-10-13 ##

### Added ###
- Add new function `client.getAgentStateHistory` retrieving a agent's state history. Take a look a the [documentation](https://beta.craft.ai/doc/js#retrieve-state-history) for further informations.

## [1.10.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.9.0...v1.10.0) - 2017-10-12 ##

### Added ###
- Introducing `craftai.interpreter.getDecisionRulesProperties` a function extracting the property used in the decision rules of a given decision tree.
- Introducing `craftai.interpreter.decideFromContextsArray` a function that takes decisions on an array of several contexts at once.

### Fixed ###
- `craftai.interpreter.decide` no longer omits to return the standard deviation if it is exactly 0.

### Deprecated ###
- `craftai.decide` is deprecated in favor of `craftai.interpreter.decide`.

## [1.9.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.8.0...v1.9.0) - 2017-08-22 ##

### Added ###
- `client.getAgentContextOperations` takes two new optional parameters defining time bounds for the desired operations.

### Changed ###
- `client.getAgentContextOperations` handles the pagination automatically, making as many request as necessary to the API.
- Updating the code linter rules to the latest version of [`eslint-config-craft-ai`](https://www.npmjs.com/package/eslint-config-craft-ai).
- Requests sent to the craft ai have a specific `User-Agent` to identify the used client version & platform.

### Fixed ###
- TypeScript type definition of the client method `client.addAgentContextOperations` now accepts a single context operation.
- When using Node.js, created instance of `Time` with no specified timezone now properly take into account the local timezone.

## [1.8.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.7.1...v1.8.0) - 2017-08-11 ##

### Added ###
- TypeScript definitions for the client methods

## [1.7.1](https://github.com/craft-ai/craft-ai-client-js/compare/v1.7.0...v1.7.1) - 2017-08-08 ##

### Fixed ###
- `Time` are now properly created from floating point timestamp (e.g. from `Date.now() / 1000`)
- `client.addAgentContextOperations` with no operations no longer triggers a request to craft ai and resolves with a message

## [1.7.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.6.0...v1.7.0) - 2017-08-02 ##

### Added ###
- Finally adding a changelog file (yes this one).
- Adding a helper script to maintain the changelog.
- Checking agent name at the agent creation to prevent erroneous behavior with the api route.

## [1.6.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.5.2...v1.6.0) - 2017-07-25 ##

### Removed ###
- `client.addAgentContextOperations` no longer buffers context operations before sending them to the API ; its third parameter as well as `cfg.operationsAdditionWait` are no longer taken into account.

## [1.5.2](https://github.com/craft-ai/craft-ai-client-js/compare/v1.5.1...v1.5.2) - 2017-07-18 ##

### Removed ###
- `Time` is no longer able to be built from an instance of `moment`, a standard JavaScript `Date` can be provided though.

## [1.5.1](https://github.com/craft-ai/craft-ai-client-js/compare/1.5.0...v1.5.1) - 2017-07-13 ##

### Changed ###
- Documentation improvements.

## [1.5.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.4.1...1.5.0) - 2017-07-11 ##

> :warning: Update to this version is **mandatory** to continue using the craft ai API due to a bad handling of decision tree format versioning in previous versions.

### Added ###
- Now supporting the current decision tree format (_v1.1.0_).

## [1.4.1](https://github.com/craft-ai/craft-ai-client-js/compare/v1.4.0...v1.4.1) - 2017-06-19 ##

### Added ###
- A collection of unit test for the `Properties` helper functions.

## [1.4.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.3.3...v1.4.0) - 2017-06-16 ##

### Added ###
- Introduce a collection of helpers function for context properties and decision rules manipulation accessible under `Properties` (`const { Properties } = require('craft-ai)`) ; these functions are still under development and are prone to future changes.

## [1.3.3](https://github.com/craft-ai/craft-ai-client-js/compare/v1.3.2...v1.3.3) - 2017-06-09 ##

### Added ###
- A new error type, `CraftAiNullDecisionError`, is thrown during decision when the context is correct but no decision can be taken by the decision tree.

## [1.3.2](https://github.com/craft-ai/craft-ai-client-js/compare/v1.3.1...v1.3.2) - 2017-06-08 ##

### Changed ###
- The pre-decision context properties validation now supports unknown properties type, no validation is performed on these.

## [1.3.1](https://github.com/craft-ai/craft-ai-client-js/compare/v1.3.0...v1.3.1) - 2017-06-08 ##

### Added ###
- Improve the metadata attached to `CraftAiDecisionError`, most notably their property `metadata.decision_rules` can now contain the matched decision rules in the decision tree at the location of the error.

## [1.3.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.2.2...v1.3.0) - 2017-06-07 ##

### Changed ###
- Updating a bunch of dev dependencies including `babel`, `webpack` and `mocha`
- Updating and cleaning a bunch of dependencies

## [1.2.2](https://github.com/craft-ai/craft-ai-client-js/compare/v1.2.1...v1.2.2) - 2017-04-18 ##

### Fixed ###

- `Time` now properly takes into account that `day_of_week` belongs to [0,6] and not [1,7].

## [1.2.1](https://github.com/craft-ai/craft-ai-client-js/compare/v1.2.0...v1.2.1) - 2017-04-13 ##

### Fixed ###

- The decision now properly takes into account that `day_of_week` belongs to [0,6] and not [1,7].

## [1.2.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.1.1...v1.2.0) - 2017-04-13 ##

### Added ###

- Introduce `client.getSharedAgentInspectorUrl` and `client.deleteSharedAgentInspectorUrl` to, respectively, create (or retrieve) and delete the shared agent inspector url.

### Deprecated ###

- `client.getAgentInspectorUrl` is deprecated in favor of `client.getSharedAgentInspectorUrl`.

### Changed ###

- Improve the release scripts.

## [1.1.1](https://github.com/craft-ai/craft-ai-client-js/compare/v1.1.0...v1.1.1) - 2017-04-12 ##

### Fixed ###

- Explicitly provided configurations values for `owner`, `project` and `url` overrides the one extracted from the `token`.

## [1.1.0](https://github.com/craft-ai/craft-ai-client-js/compare/v1.0.0...v1.1.0) - 2017-04-04 ##

### Added ###

- Client creation now extracts the right API url, the `owner` and the `project` from the given `token`.
- When a decision error occurs, additional information are attached to the thrown error in its `metadata` key.

## 1.0.0 - 2017-03-22 ##

- Initial **final** version of the JS client
