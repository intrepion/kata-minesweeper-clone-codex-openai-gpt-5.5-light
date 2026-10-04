# ADR 0001: Build A Classic Minesweeper Clone First

## Status

Accepted

## Date

2026-10-03

## Context

The phrase "Minesweeper clone" can mean several different products: a faithful classic desktop clone, a modern mobile puzzle app, a training tool with hints and probability overlays, an arcade variant, or a speedrunning-focused tool.

The first product direction needs to be settled before implementation because it determines the interaction contract, difficulty model, visual hierarchy, test cases, and what counts as a complete MVP.

## Decision

Build a faithful classic Minesweeper clone first, with modern responsive presentation and a small amount of speedrunner-friendly polish.

The initial product direction includes:

- Classic rules and interactions.
- Desktop-first play with touch support.
- Beginner, Intermediate, and Expert difficulties.
- First-click safety that prefers opening a zero-cell area when possible.
- Reveal, flag, chording, long-press touch flagging, mine counter, timer, and reset face.
- Seedable games where practical.

## Consequences

Implementation should prioritize fast, legible board play over novelty mechanics. Features such as campaign progression, powerups, probability hints, undo, tutorials, and custom boards are outside the first direction unless explicitly reintroduced later.

Testing should cover the classic interaction contract, especially first-click safety, flagging, chording, win/loss detection, and difficulty dimensions.
