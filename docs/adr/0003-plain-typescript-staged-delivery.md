# ADR 0003: Use Plain TypeScript With Staged Delivery

## Status

Accepted

## Date

2026-10-03

## Context

The project is still documentation-only. The next decision fixes the implementation approach before scaffolding: whether to use a UI framework, how much of the game should be browser-independent, what persistence belongs in the MVP, what verification is required, and whether local file launch is part of the delivery contract.

These choices shape the project layout, test suite, build pipeline, and acceptance evidence. They are more expensive to reverse once implementation begins.

## Decision

Build the game as a Vite and TypeScript app using plain DOM and CSS rather than React.

The accepted implementation direction includes:

- Keep board generation, reveal, flagging, chording, win and loss detection, and game state transitions in pure TypeScript modules.
- Render the browser UI separately from the game engine.
- Remember only the selected difficulty between sessions for the MVP.
- Defer stats, game history, visible seed sharing, and custom boards.
- Verify with unit tests for board logic and Playwright smoke tests for the player-visible game path.
- Include browser checks for starting a game, first-click safety, flagging, chording, win and loss surfaces, and responsive Expert rendering.
- Support direct-file launch in addition to development server and build preview.
- Deliver in staged MVP slices with verified commits: first the scaffold and pure game engine, then the playable UI, then polish, responsive behavior, and direct-file launch.

## Consequences

The implementation should stay small and explicit. Framework-level component abstractions should not appear unless a later decision changes the UI architecture.

The game engine must be testable without browser rendering. The final delivery must prove both built-server behavior and direct-file behavior, because file launch can fail in ways ordinary Vite checks miss.
