# Minesweeper Clone Context

## Glossary

### Board

The rectangular field of cells for a single game. The settled MVP boards are Beginner, Intermediate, and Expert.

### Cell

One square on the board. A cell may hide a mine, be unrevealed, be revealed, or be flagged.

### Chording

The action of revealing all unrevealed neighboring cells around a revealed numbered cell when the number of adjacent flags matches that cell's number.

### Classic Minesweeper

A faithful version of the familiar desktop Minesweeper experience: fixed difficulty boards, mine counter, timer, reset face, fast reveal and flag interactions, first-click safety, and chording.

### Difficulty

A predefined board size and mine count. The settled MVP difficulties are Beginner at 9 by 9 with 10 mines, Intermediate at 16 by 16 with 40 mines, and Expert at 30 by 16 with 99 mines.

### First-Click Safety

The guarantee that the first revealed cell cannot contain a mine. The clone should prefer making the first reveal open a zero-cell area when possible.

### Flag

A player mark on an unrevealed cell indicating that the player believes the cell hides a mine.

### Mine Counter

The display showing the remaining unflagged mine estimate, calculated from the mine count minus current flags.

### Reveal

The player action that uncovers a cell. Revealing a mine ends the game; revealing a safe cell may expose a number or open an empty area.

### Seed

A value that can reproduce the same mine layout and game setup.

### Touch Flagging

A touch-friendly flag action, settled for MVP as long-pressing an unrevealed cell.
