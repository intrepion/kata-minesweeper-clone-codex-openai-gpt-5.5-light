# ADR 0004: Support Accessible Classic Input And End States

## Status

Accepted

## Date

2026-10-03

## Context

The core product direction and implementation approach are settled. The remaining gameplay-facing decisions before implementation concern how cells communicate their contents, whether the reset face should have expressive classic states, what accessibility support belongs in the MVP, what keyboard controls are required, and what the board shows after a loss.

These choices affect markup, focus management, visual states, automated browser coverage, and whether the clone feels like Minesweeper rather than merely resembling it.

## Decision

Use reliable text and symbols for cell contents, preserve classic expressive reset-face states, and make keyboard and accessibility support part of the MVP.

The accepted interaction direction includes:

- Use text and symbols for numbers, flags, and mines, styled with CSS rather than image assets.
- Give the reset face neutral, pressed or surprised, happy, and dead states.
- Provide keyboard controls: arrow keys move focus, Space or Enter reveals, F toggles a flag, and R resets the game.
- Allow Space or Enter on a revealed number to chord when its flag count is satisfied.
- Provide visible focus, useful ARIA labels for cells, number meanings that are not color-only, and reduced-motion-safe behavior.
- On loss, reveal all mines, distinguish the exploded mine, distinguish incorrect flags, and keep correctly flagged mines recognizable.

## Consequences

The board cannot be treated as pointer-only. Rendering must expose stable focus targets and descriptive cell state for assistive technology, and browser tests should include keyboard paths in addition to mouse paths.

The MVP can avoid image asset pipelines for cell contents. Visual polish should come from typography, spacing, color, borders, and state styling.
