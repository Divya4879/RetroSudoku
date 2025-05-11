# RADICAL SUDOKU EXTREME

A retro-style, 90s-inspired Sudoku game with neon aesthetics, synthesized sound effects, and radical gameplay!

## Live Preview

You can check it out here at [RetroSudoku](https://retrosudoku.netlify.app)

## Features

- 🎮 Authentic 90s retro aesthetic with neon colors and pixelated fonts
- 🎵 Procedurally generated sound effects using Web Audio API
- 🎯 Ten progressive difficulty levels from "NOVICE NEBULA" to "ULTIMATE UNIVERSE"
- ⏱️ Timer and scoring system with bonuses for consecutive correct moves
- 💡 Hint system for when you get stuck
- 🎮 Keyboard support for number entry and navigation
- 📱 Responsive design that works on desktop and mobile
- 🌙 Multiple themes with toggle functionality
- 🔊 Customizable sound settings
- ✨ Toggle animations for performance optimization

## How to Play

1. Select a difficulty level from the 10 available options
2. Use the game board to solve the Sudoku puzzle
3. Click on a cell to select it
4. Enter a number using the on-screen number pad or keyboard
5. Complete the grid following Sudoku rules:
   - Each row must contain digits 1-9 without repetition
   - Each column must contain digits 1-9 without repetition
   - Each 3x3 box must contain digits 1-9 without repetition

## Game Controls

- **RESTART**: Start a new puzzle at the current difficulty level
- **HINT**: Get help with a difficult cell (uses one hint)
- **SOLVE**: Reveal the entire solution (ends the current game)
- **EXIT**: Return to the level selection screen
- **🔊**: Toggle sound effects on/off
- **🌙**: Toggle between light and dark themes
- **✨**: Toggle animations on/off
- **⏸️**: Pause the current game

## Scoring System

- Base points based on difficulty level
- Points for each correctly placed number
- Bonus points for consecutive correct moves
- Time bonus for quick completion
- Difficulty multiplier based on selected level
- Penalties for using hints or making mistakes (maximum 4 mistakes allowed)

## Technologies Used

- HTML5, CSS3, and JavaScript
- Web Audio API for procedurally generated sound effects
- CSS Grid for the game board layout
- CSS animations for visual feedback
- Google Fonts ("Press Start 2P") for retro typography
- Responsive design for all devices

## Project Structure


retro-sudoku/
├── index.html              # Main game HTML
├── css/
│   ├── style.css           # Main game styles
│   └── themes.css          # Theme definitions (light/dark)
├── js/
│   ├── game.js             # Core game logic
│   ├── sudoku-generator.js # Puzzle generation algorithm
│   ├── ui.js               # User interface management
│   ├── sound.js            # Sound effects and music
│   └── themes.js           # Theme switching functionality
└── assets/
   ├── fonts/              # Custom fonts
   ├── images/             # Game graphics
   └── sounds/             # Audio files

## Running the Game

Simply open `index.html` in any modern web browser to start playing!

## Development Notes

- The game uses a backtracking algorithm to generate valid Sudoku puzzles
- Difficulty is controlled by how many cells are initially revealed
- The sound system uses the Web Audio API to generate retro-style sound effects
- The UI is fully responsive and works on mobile devices
- Theme switching is handled dynamically without page reload

## Credits

Created by Divya using Amazon Q Developer for the "That's Entertainment!" challenge.

Font: "Press Start 2P" by CodeMan38 (Google Fonts)

## License

This project is open-source and under MIT License.
