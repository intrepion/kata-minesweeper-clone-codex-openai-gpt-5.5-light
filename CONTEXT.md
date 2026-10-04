# Minesweeper Clone Context

## Glossary

### Board

The rectangular field of cells for a single game. The settled MVP boards are Beginner, Intermediate, and Expert.

### Board Scaling

The way a board adapts to available screen space. Expert mode should keep its 30 by 16 shape while fitting horizontally where practical and supporting compact scaling or pan and zoom on narrow screens.

### Browser Smoke Test

A real-browser check that exercises player-visible behavior rather than only validating compiled code.

### Cell

One square on the board. A cell may hide a mine, be unrevealed, be revealed, or be flagged.

### Chording

The action of revealing all unrevealed neighboring cells around a revealed numbered cell when the number of adjacent flags matches that cell's number.

### Classic Minesweeper

A faithful version of the familiar desktop Minesweeper experience: fixed difficulty boards, mine counter, timer, reset face, fast reveal and flag interactions, first-click safety, and chording.

### Direct-File Launch

The ability to open the built game through a local file URL without a development server.

### Difficulty

A predefined board size and mine count. The settled MVP difficulties are Beginner at 9 by 9 with 10 mines, Intermediate at 16 by 16 with 40 mines, and Expert at 30 by 16 with 99 mines.

### First-Click Safety

The guarantee that the first revealed cell cannot contain a mine. The clone should prefer making the first reveal open a zero-cell area when possible.

### Flag

A player mark on an unrevealed cell indicating that the player believes the cell hides a mine.

### Flag Cycle

The state transition for marking a hidden cell. The settled MVP cycle is unrevealed to flagged to unrevealed, without a question-mark state.

### Game Engine

The browser-independent game logic responsible for board generation, reveal, flagging, chording, win and loss detection, and game state transitions.

### Mine Counter

The display showing the remaining unflagged mine estimate, calculated from the mine count minus current flags.

### Playable UI

The browser interface that renders the game engine state and handles player input.

### Question Mark

An old Minesweeper mark for uncertain cells. Question marks are excluded from the MVP flag cycle.

### Reveal

The player action that uncovers a cell. Revealing a mine ends the game; revealing a safe cell may expose a number or open an empty area.

### Result Summary

A small end-of-game display that shows the outcome and final time without blocking inspection of the board.

### Seed

A value that can reproduce the same mine layout and game setup.

### Selected Difficulty

The player's current difficulty choice. The MVP should remember this between sessions.

### Staged MVP Slice

An independently verified delivery step with a narrow playable or testable outcome.

### Timer

The game clock. It starts on the first reveal, stops on win or loss, and resets on a new game; flagging before the first reveal does not start it.

### Touch Flagging

A touch-friendly flag action, settled for MVP as long-pressing an unrevealed cell.

### Visual Skin

The presentation style layered over the classic board structure. The settled MVP skin is modern and clean while preserving classic Minesweeper readability.
