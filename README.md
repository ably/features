# Ably Features

[![Check](https://github.com/ably/features/actions/workflows/check.yml/badge.svg)](https://github.com/ably/features/actions/workflows/check.yml)
[![Assemble](https://github.com/ably/features/actions/workflows/assemble.yml/badge.svg)](https://github.com/ably/features/actions/workflows/assemble.yml)

_[Ably](https://ably.com) is the platform that powers synchronized digital experiences in realtime. Whether attending an event in a virtual venue, receiving realtime financial information, or monitoring live car performance data – consumers simply expect realtime digital experiences as standard. Ably provides a suite of APIs to build, extend, and deliver powerful digital experiences in realtime for more than 250 million devices across 80 countries each month. Organizations like Bloomberg, HubSpot, Verizon, and Hopin depend on Ably’s platform to offload the growing complexity of business-critical realtime data synchronization at global scale. For more information, see the [Ably documentation](https://ably.com/documentation)._

## Overview

This repository has been created as the starting point and canonical root for information relating to how we programmatically track Ably features at Ably.
The focus of the contents of this repository is on our SDKs (sometimes referred to as client libraries).
Our SDKs provide the primary, language/platform-idiomatic APIs that our customers - software application developers -
use in order to integrate and leverage the Ably platform in their solutions.

---

:warning: **Incubating** :warning:  
The contents of this repository (state of `HEAD` of `main` branch) are currently in a [`pre-release` state](https://semver.org/#spec-item-9), hence the `-alpha` suffix on the value of the `version` field in [package.json](package.json).  
This will change once all of the issues under [the **1.2.0 Release / GA** milestone](https://github.com/ably/features/milestone/1) have been completed. See the description on that milestone for more detail.

---

## Introduction

The data and code files in this repository are incubating as a prototype, formulating the foundations of Ably's approach to SDK feature tracking going forwards.

These are the pivotal components:

| Component | Purpose |
| ---- | ------- |
| [`sdk.yaml`](sdk.yaml) | The canonical feature list that Ably SDKs can support, represented as a tree. |
| [`sdk-manifests/`](sdk-manifests/) | Temporary location (while we prototype) for manifests, per SDK source code repository, declaring what features that SDK supports. These files will ultimately be moved to be managed as peer-level source code in each SDK's source code repository. |
| [`build.js`](build.js) | Proof-of-concept build tool. The primary purposes of this program, for the time being, are to: (1) validate the structure of data files - canonical feature list and SDK manifest(s); and (2) render a view of the data to enhance understanding and demonstrate utility, both present and potential. |

This document aims to not duplicate information that readers/reviewers can gain for themselves by inspecting the source code of the components described in the table above.
It does, however, aim to expand on concepts and append context - with the hope that this will help readers/reviewers understand the reasons behind design choices made.

## Future Direction

### Future Direction for the SDK Manifests

As mentioned in [the Introduction to this document](#introduction),
[the manifest source files]((sdk-manifests/))
are only in this repository right now on a temporary basis while we incubate this prototype.

They will be moved to the SDK repositories to which they pertain, to be managed as source code in that location, allowing for them to be atomically evolved alongside the interface and implementation source code that they document.

Once they've moved, they will be treated as first-class citizens in their SDK repository homes. It will be a requirement that we run checks in CI, within each SDK repository, that validate that SDK's manifest against the canonical feature list - hence the `common-version` root node in manifests, as this will need to be anchored to allow the content of _this_ repository (`ably/features`) to evolve independently.

Within the contents of each SDK repository, the manifest files will be located under a standard filename, in a standard location:

- Location: `.ably/`
- Filename: `capabilities.yaml`

:magic_wand: At that point, it is anticipated that the real magic can start...

#### Per-SDK Magic

- **Key Information, Front and Centre**: standard Git tools will help us to understand the evolution of the SDK from a customer-focussed perspective, by simply `diff`'ing this single file
- **Validation Against Source Code Interfaces**: either using runtime-build reflection or source-code annotation we can evolve language-specific tools that link the SDK-specific APIs back to canonical feature nodes, allowing us to navigate back and forth between the two

#### Estate-wide Magic

- **Customer Facing Feature Matrix**: We have the information to be able to contribute, with automation, to the contents of the [Ably Feature Support Matrix](https://ably.com/download/sdk-feature-support-matrix):
  - built using a GitHub workflow hosted in a brand new intermediary repository, generating an artifact that can be consumed by the tools used by our developer education and documentation team (probably a public [npm](https://www.npmjs.com/) package)
- **Full Feature Compliance Matrix**: Primarily for use by the Ably SDK Team, but (as with everything we do, [open for all](https://ably.com/blog/ably-values)) available to be viewed in the public domain. Likely to be an evolution of what you see assembled by [`build.js`](build.js) and uploaded by [the assemble workflow](../workflows/assemble.yml) to `sdk.ably.com`. Providing complete visibility over what features each SDK implements at an appropriate level of granularity.

### Future Direction for the Client Library Features Specification

This single source file will remain our reference for:

- protocol details, including interactions with SDK state and behaviours
- SDK implementation details
- conformed naming for types and their members
- testing requirements (though it is anticipated that, at some point in the future, we will these from the scope of concern for this source file)

Currently:

- Source location: [`features.textile` in `ably/docs`](https://github.com/ably/docs/blob/main/content/client-lib-development-guide/features.textile)
- Backlog of tasks: [issues in `ably/docs`](https://github.com/ably/docs/issues?q=is%3Aopen+is%3Aissue+label%3Aclient-lib-spec)
- Rendered views:
  - Preview: [docs.ably.com](https://docs.ably.com/client-lib-development-guide/features/)
  - Published: [ably.com/docs](https://ably.com/docs/client-lib-development-guide/features)

Going forwards, this source file will move from `ably/docs` to `ably/specification` (this work is happening under https://github.com/ably/specification/issues/1).
It can then more logically be managed alongside other efforts to catalogue and track SDK features. That will include validation:

- **Internal**: ensuring that it is consistent in terms of formatting and relative references to itself
- **External**: ensuring that 'spec point' references in [the canonical feature list](sdk.yaml) exist in the 'spec' (this source file)

It will probably remain in textile format, for various reasons, at least in the short to medium term.

### Future Direction for This Repository

Based on the future directions laid out above for [SDK Manifests](#future-direction-for-the-sdk-manifests) and [the Client Library Features Specification](#future-direction-for-the-client-library-features-specification), we must evolve the way we view and treat this source code repository.

This will start with a **well-defined release procedure**:

- Add versioning, _strictly_ conforming to [the requirments Semantic Versioning](https://semver.org/), starting at version `1.2.0` (our epoch), indicating the version of the canonical feature list.
- Publish the canonical feature list to one or more package management / distribution points, for downstream consumption by SDK repositories as well as other systems at Ably (i.e. developer education / documentation), as part of this new release procedure.

See also:

- [ADR66: New home for the features specification (internal)](https://ably.atlassian.net/wiki/spaces/ENG/pages/2278817920/ADR66+New+home+for+the+features+specification)

## Future Direction for Specification Point Adherence Tracking

We have
[this Google Sheets document](https://docs.google.com/spreadsheets/d/1ZbAfImxRLRKZNe4KPX7b_0BVVI-qyqnvbAco5TFWSQU/edit?usp=sharing)
which has been used at Ably, by client library SDK developers,
to indicate adherence to individual
[feature specification points](https://docs.ably.com/client-lib-development-guide/features/)
by their
SDK source codebase.
_Request permission from your Manager if you would like access to this spreadsheet._

The detail captured in that spreadsheet is an important source of information which should be able to help us understand the level of features specification compliance across our SDKs. As such, it should be considered a valuable source of truth when it comes to working out what features are implemented across our SDKs.

Additionally, it is very likely that we will continue to want to track feature specification point adherence, at that level of fine granularity, going forwards.

What is clear, however, is that a Google Sheets document is probably not the appropriate venue to continue tracking this information. Instead, the currently anticipated solution is that we export the information per-SDK from that spreadsheet and represent it in a simple format as a 'feature specification point adherence checklist' (/ manifest) in each SDK source code repository (CSV, YAML or some other logical textual data format). This would be instantiated via an initial snapshot process, after which it could be evolved atomically as an additional part of the source code of that SDK, with the spreadsheet becoming obsolete once all SDKs have been exported.

## What makes a Feature?

[The canonical feature list](sdk.yaml) does not represent an API, nor is it intended to form the basis for an IDL.
It is a user-facing list of human readable feature names, which are presented as a tree of nodes because it's logical to do so, and just happen to also be machine readable.

To warrant placement as a node within the tree, at any level, a Feature must represent or group together direct, user-facing functionality.

Nodes in the tree are not abstract. We do not have any concept of 'implements' or 'extends' attribution on Feature nodes, meaning that the only context a Feature node can imbue is that provided by its placement in the tree (i.e. its parent Feature nodes).

A good litmus test is to consider what would be the implication, from an application developer's perspective, if the Feature node under consideration was removed from the tree. If there is no concrete, absolute, direct functionality that disappears as a result - isolated to the Feature node's context, only based on position in the tree - then it should not have been present in the tree, nor should it have been referred to as a Feature.

An example of something that intentionally does not appear in the tree as a Feature node is the concept of a `PaginatedResult`, otherwise known as the data type that offers APIs that provide support for results to be returned to the application in relatively small chunks referred to as pages (pagination).
We have Feature nodes that implicitly imply Pagination support, which will be specified by one the features spec points they reference, however we don't have an explicit Feature node that specifies Pagination as a discrete functionality in isolation.
An SDK will add support for abstract Pagination (perhaps using generics, where available) as an automatic requirement and consequence of implementing a feature that implies the need for Pagination support, from the features spec..

## Feature Node Names

The names of feature nodes (those not prefixed with a dot '`.`' to denote them as properties) in [the canonical feature list](sdk.yaml) should conform to the following requirements:

- not use abbreviations
- use plural form only if it's strictly necessary - i.e.:
  - use plural form when the concept being captured is _always_ dealing with many things - e.g. `Options`, `Options: Agents` and `Push Notifications`
  - use plural form when the plurality is utterly baked into the naming of the primary type involved - e.g. `Options: Token Details`
  - do not use plural form when the feature links to a primary type and includes methods or properties that involve with that type in both singular and plural contexts - e.g. `Push Notifications: Administration: Device Registration`

This is so that we keep a consistent 'tone of voice', making feature names that are easily comprehensible by human readers and sit alongside one another congruously.

## Feature Node Synopsis

There's a difficult balance to find here when writing these descriptions.

We don't want to be too prescriptive around API details such as:

- names of interfaces, classes or properties
- the nature of delivery - that is, whether synchronous or asynchronous - as that kind of language may be too prescriptive for some SDK settings
- mechanisms for failure reporting - errors, exceptions, codes, etc..

However, there is also a lot of prior art in our SDKs, so mention of particular phrases or API names can help with discovery for readers of this work.

Prefixes such as "Capability to" and "Support for" should generally be avoided, in particular at the start of the first sentence of any given synopsis.
This is because the entire document is about capabilities to do "X", so additional wording such as "Capability for the application to do X" is superfluous and not helpful to the reader.

Consistently use imperative, present tense where that makes sense (also known as 'imperative mood' in the context of git commit messages) - e.g.:

- "Provide a literal token" rather than "Providing a literal token"
- "Return continuous message history" rather than "Used to return continuous message history"

As we evolve this work we can hopefully add to this guidance around what should be included and what should be avoided.

## Feature Node Dependencies

A feature node is able to express that it `requires` one or more features in order to be able to be implemented in an SDK.
The following logical constraints should apply - a feature:

- must only indicate it requires another feature if it cannot exist or otherwise _fully_ function without that other feature having also been implemented
- cannot require one of its parent features, as that's implicit
- should only require both the `REST` and `Realtime` features if both of them **must** be present in the SDK for the feature to work at all,
  in other words:
  - :green_circle: _needs both_: if it requires **both** `REST` **and** `Realtime` to be viable, then it should include them both in its `requires` property
  - :red_circle: _needs one, the other, or both_: if it requires **either** `REST` **or** `Realtime` to be viable, then it must not include either of them in its `requires` property
  - :green_circle: _needs just REST_: if it requires `REST` but does not require or otherwise relate to `Realtime`, then it should include `REST` in its `requires` property
  - :green_circle: _needs just Realtime_: if it requires `Realtime` but does not require or otherwise relate to `REST`, then it should include `Realtime` in its `requires` property

When a feature node 'A' indicates that it requires another feature 'B', then it's implied that any children of 'A' also require 'B'.

The `requires` property allows a feature to express which other feature(s) it requires using one or more references to feature nodes in the tree, where a reference is a string path with node names delimited by a colon followed by a space (`': '`).

We have chosen to use a colon within the delimiter because it's logical in human readable form - e.g.:

    Service: Fallbacks: REST Follows Realtime

This is intentionally the same formatting that we use in the rendered view to represent a fully-qualified feature node path.

The implication of this choice of delimiter is that, in YAML, these node references - if referring to a non-root node - need to be quoted. e.g.:

```yaml
.requires:
  - REST
  - 'Debugging: Error Information'
```

Where:

- the `REST` feature node reference did not need to be quoted, as it's a root node, therefore a path with only one segment
- the `Debugging: Error Information` feature node reference must be quoted, as it's a child of a root node, therefore a path with more than one segment

We will add checks in [#64](https://github.com/ably/features/issues/64).

## Disincluded Features

### `ClientOptions#logExceptionReportingUrl`

Specified by [TO3m](https://docs.ably.com/client-lib-development-guide/features/#TO3m)
and [RSC20](https://docs.ably.com/client-lib-development-guide/features/#RSC20).

Will be removed under [ably/docs#1381](https://github.com/ably/docs/issues/1381).
