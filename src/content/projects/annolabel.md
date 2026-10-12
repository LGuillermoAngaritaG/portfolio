---
publication: 'published'
title: 'AnnoLabel'
date: '2026-10-11'
link: 'https://github.com/Andesprit/annolabel'
tags: ['Computer Vision', 'Data Annotation', 'Developer Tools']
category: 'developer-tool'
source_visibility: 'public'
license: 'MIT'
status: 'unspecified'
description: 'Validate and visually review agent-supplied image annotations, then export labels, boxes and polygons as COCO.'
skip: false
display_order: 2
image: 'projects/annolabel.webp'
image_alt: 'Concept illustration of reviewing bounding boxes and polygons before COCO export. Not a product screenshot.'
image_fit: 'contain'
---

<!-- Generated from Andesprit catalog; use scripts/sync-presence.mjs. -->

Validate and visually review agent-supplied image annotations, then export labels, boxes and polygons as COCO.

[View source](https://github.com/Andesprit/annolabel)

## Scope and ownership

A local task, submission and review pipeline for classifications, bounding boxes and simple segmentation polygons, with COCO export.

Andesprit project · annotation validation and review CLI

## An engineering decision

Separate the model from the annotation tool. AnnoLabel validates and stores supplied geometry; the vision-capable agent provides the labels and boundaries.

## Access and source

Developer tool. Open source · MIT.

[License](https://github.com/Andesprit/annolabel/blob/main/LICENSE).

Python 3.11–3.14 · macOS, Linux, Windows.

## Current scope

AnnoLabel does not call vision models or infer boundaries. Valid geometry is not proof of visual accuracy. Holes, multipart instances, video and keypoints are not supported.

_Concept illustration of reviewing bounding boxes and polygons before COCO export. Not a product screenshot._

Public evidence reviewed: 2026-10-11.

[Canonical project](https://github.com/Andesprit/annolabel).
