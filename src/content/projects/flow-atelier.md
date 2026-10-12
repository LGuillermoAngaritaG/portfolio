---
publication: 'published'
title: 'Flow Atelier'
date: '2026-10-11'
link: 'https://github.com/Andesprit/flow-atelier'
tags: ['Agents', 'Workflow Automation', 'Developer Tools']
category: 'developer-tool'
source_visibility: 'public'
license: 'Apache-2.0'
status: 'unspecified'
description: 'Compose agent and tool tasks into reproducible workflows, with review and human input along the way.'
skip: false
display_order: 0
image: 'projects/flow-atelier.webp'
image_alt: 'Connected brass workflow stations branching through a human-operated approval gate in an emerald atelier. Illustration, not a product screenshot.'
---

<!-- Generated from Andesprit catalog; use scripts/sync-presence.mjs. -->

Compose agent and tool tasks into reproducible workflows, with review and human input along the way.

[View source](https://github.com/Andesprit/flow-atelier)

## Scope and ownership

A local CLI and async engine that runs YAML conduits as a directed graph of agent and tool tasks.

Andesprit project · original workflow engine

## An engineering decision

Make task dependencies explicit. A run records its task outputs and can pause for human input, so the workflow is inspectable instead of hidden inside a chat.

## Access and source

Developer tool. Open source · Apache-2.0.

[License](https://github.com/Andesprit/flow-atelier/blob/main/LICENSE).

macOS Apple Silicon · Linux · Windows.

## Current scope

Conduits can execute shell commands. Review packages before running them; individual agents still depend on their own tools and accounts.

_Connected brass workflow stations branching through a human-operated approval gate in an emerald atelier. Illustration, not a product screenshot._

Public evidence reviewed: 2026-10-11.

[Canonical project](https://github.com/Andesprit/flow-atelier).
