# ADR 0002: Use A Modern Skin With Classic Interaction Boundaries

## Status

Accepted

## Date

2026-10-03

## Context

After choosing a classic Minesweeper product direction, the next decision was whether to recreate the old Windows look exactly or preserve the classic structure with a cleaner modern skin.

The interface also needs clear boundaries for Expert board scaling, flag state, timer behavior, seed visibility, and win presentation. Without those decisions, implementation could drift toward either a pixel-perfect nostalgia piece or a modern puzzle app that loses the fast desktop Minesweeper contract.

## Decision

Use a modern skin with classic Minesweeper structure.

The accepted interface direction includes:

- Preserve the recognizable board, mine counter, timer, and reset face layout.
- Use modern visual styling rather than a pixel-perfect Windows recreation.
- Keep Expert mode as 30 by 16 with 99 mines, using responsive cell sizing where practical and compact scaling or pan and zoom on narrow screens.
- Use a two-state flag cycle: unrevealed to flagged to unrevealed.
- Exclude question marks from the MVP.
- Start the timer on the first reveal, not on pre-reveal flagging.
- Stop the timer on win or loss and reset it on a new game.
- Support seeds internally for reproducibility before adding visible seed or share UI.
- On win, freeze the board, stop the timer, show a happy reset face, preserve the final board, and show a small result summary without a blocking modal.

## Consequences

The UI should feel fast and familiar even when it does not visually imitate a specific Windows version. Tests should treat the classic interaction contract as more important than ornamental styling.

Visible seed sharing, question marks, custom boards, and larger post-game overlays are deferred unless a later round explicitly brings them back.
