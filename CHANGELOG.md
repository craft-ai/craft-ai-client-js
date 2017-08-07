# Changelog #

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/craft-ai/craft-ai-client-js/compare/v1.7.0...HEAD) ##
### Fixed ###
- `Time` are now properly created from floating point timestamp (e.g. from `Date.now() / 1000`)

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
- `client.getAgentInspectorUrl` is deprecated in favor of `client.getSharedAgentInspectorUrl`.x
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