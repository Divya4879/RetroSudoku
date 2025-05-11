/**
 * RADICAL SUDOKU EXTREME - Game Logic
 * Manages the core game mechanics and state
 */

class SudokuGame {
    constructor() {
        this.generator = new SudokuGenerator();
        this.currentPuzzle = null;
        this.solution = null;
        this.playerGrid = null;
        this.selectedCell = null;
        this.startTime = null;
        this.timerInterval = null;
        this.score = 0;
        this.hintsUsed = 0;
        this.mistakes = 0;
        this.maxMistakes = 4;
        this.gameActive = false;
        this.gamePaused = false;
        this.pausedTime = 0;
        this.level = 1; // Default level (1-10)
        this.correctMoves = 0; // Track consecutive correct moves
        
        // Initialize the UI
        this.ui = new SudokuUI(this);
        
        // Initialize sound manager
        if (typeof window.SoundManager !== 'undefined') {
            this.sound = new window.SoundManager();
        } else {
            console.error("SoundManager not available");
            // Create a dummy sound object
            this.sound = {
                play: () => {},
                toggleSound: () => {}
            };
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize theme manager after UI is created
        setTimeout(() => {
            try {
                if (typeof ThemeManager !== 'undefined') {
                    this.theme = new ThemeManager();
                }
            } catch (error) {
                console.error("Error initializing theme manager:", error);
            }
        }, 500);
    }

    /**
     * Set up event listeners for game controls
     */
    setupEventListeners() {
        try {
            // Level selection buttons
            document.querySelectorAll('.level-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const level = parseInt(btn.getAttribute('data-level'));
                    this.selectLevel(level);
                });
            });
            
            // Action buttons
            document.getElementById('restart-btn').addEventListener('click', () => {
                this.restartGame();
                this.sound.play('start');
            });
            document.getElementById('hint-btn').addEventListener('click', () => this.giveHint());
            document.getElementById('solve-btn').addEventListener('click', () => this.solveGame());
            document.getElementById('exit-btn').addEventListener('click', () => this.exitToLevelSelect());
            
            // Number pad
            document.querySelectorAll('.number-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const number = parseInt(btn.getAttribute('data-number'));
                    this.enterNumber(number);
                });
            });
            
            // Sound toggle
            document.getElementById('sound-toggle').addEventListener('click', () => this.sound.toggleSound());
            
            // Pause toggle - initially hidden
            const pauseToggle = document.getElementById('pause-toggle');
            if (pauseToggle) {
                pauseToggle.style.display = 'none'; // Hide pause button initially
                pauseToggle.addEventListener('click', () => this.togglePause());
            }
            
            // Message box close button
            document.getElementById('message-close').addEventListener('click', () => {
                document.getElementById('message-box').classList.add('hidden');
            });
            
            // Keyboard input
            document.addEventListener('keydown', (e) => {
                if (!this.gameActive || this.gamePaused) return;
                
                // Number keys 1-9
                if (e.key >= '1' && e.key <= '9') {
                    this.enterNumber(parseInt(e.key));
                }
                // Delete or Backspace for erasing
                else if (e.key === 'Delete' || e.key === 'Backspace') {
                    this.enterNumber(0);
                }
                // Arrow keys for navigation
                else if (e.key.startsWith('Arrow') && this.selectedCell) {
                    const [row, col] = this.selectedCell;
                    let newRow = row;
                    let newCol = col;
                    
                    switch (e.key) {
                        case 'ArrowUp': newRow = Math.max(0, row - 1); break;
                        case 'ArrowDown': newRow = Math.min(8, row + 1); break;
                        case 'ArrowLeft': newCol = Math.max(0, col - 1); break;
                        case 'ArrowRight': newCol = Math.min(8, col + 1); break;
                    }
                    
                    if (newRow !== row || newCol !== col) {
                        this.selectCell(newRow, newCol);
                    }
                }
                // P key for pause
                else if (e.key === 'p' || e.key === 'P') {
                    this.togglePause();
                }
            });
        } catch (error) {
            console.error("Error setting up event listeners:", error);
        }
    }

    /**
     * Select a level and start the game
     * @param {number} level - Level number (1-10)
     */
    selectLevel(level) {
        try {
            // Set the level
            this.level = Math.max(1, Math.min(10, level));
            
            // Get level name
            const levelName = this.getLevelName(this.level);
            
            // Update level display
            const levelDisplay = document.getElementById('current-level');
            if (levelDisplay) {
                levelDisplay.textContent = this.level;
            }
            
            // Update the level indicator
            this.updateLevelIndicator();
            
            // Hide level select screen and show game screen
            const levelSelectScreen = document.getElementById('level-select-screen');
            const gameScreen = document.getElementById('game-screen');
            
            if (levelSelectScreen) levelSelectScreen.classList.add('hidden');
            if (gameScreen) gameScreen.classList.remove('hidden');
            
            // Show pause button when game starts
            const pauseToggle = document.getElementById('pause-toggle');
            if (pauseToggle) {
                pauseToggle.style.display = 'inline-block';
            }
            
            // Start a new game
            this.startNewGame();
            
            // Play start sound
            this.sound.play('start');
        } catch (error) {
            console.error("Error selecting level:", error);
        }
    }
    
    /**
     * Get the name for a specific level
     * @param {number} level - Level number (1-10)
     * @returns {string} - Level name
     */
    getLevelName(level) {
        const levelNames = [
            "Novice Nebula",      // Level 1
            "Puzzle Prodigy",     // Level 2
            "Grid Guardian",      // Level 3
            "Number Ninja",       // Level 4
            "Logic Luminary",     // Level 5
            "Sudoku Sorcerer",    // Level 6
            "Digit Dynamo",       // Level 7
            "Matrix Master",      // Level 8
            "Cosmic Calculator",  // Level 9
            "Ultimate Universe"   // Level 10
        ];
        
        return levelNames[level - 1] || `Level ${level}`;
    }

    /**
     * Start a new game with the current level
     */
    startNewGame() {
        try {
            // Generate a new puzzle based on the current level
            const result = this.generatePuzzleForLevel();
            this.currentPuzzle = result.puzzle;
            this.solution = result.solution;
            
            // Create a copy for player's progress
            this.playerGrid = this.currentPuzzle.map(row => [...row]);
            
            // Reset game state
            this.selectedCell = null;
            this.hintsUsed = 0;
            this.mistakes = 0;
            this.correctMoves = 0;
            this.gameActive = true;
            
            // Reset mistake indicators
            this.updateMistakeIndicators();
            
            // Reset and start the timer
            this.resetTimer();
            this.startTimer();
            
            // Reset the score
            this.score = 0;
            this.ui.updateScore(this.score);
            
            // Update the UI
            this.ui.renderBoard();
            
            // Reset number pad completion marks
            this.resetNumberPad();
            
            // Update level indicator
            this.updateLevelIndicator();
            
            // Get level name
            const levelName = this.getLevelName(this.level);
            
            // Show welcome message
            this.showMessage(levelName, `Get ready for ${levelName} action! Fill in the grid with numbers 1-9. Each row, column, and 3x3 box must contain all digits without repeating. You can make at most ${this.maxMistakes} mistakes!`);
        } catch (error) {
            console.error("Error starting new game:", error);
            this.showMessage('OOPS!', 'There was an error starting the game. Please try again.');
        }
    }
    
    /**
     * Reset the number pad by removing completion marks
     */
    resetNumberPad() {
        try {
            // Find all number buttons in the number pad
            const numberBtns = document.querySelectorAll('.number-btn');
            numberBtns.forEach(btn => {
                // Remove completed class
                btn.classList.remove('completed');
                
                // Remove any complete marks
                const completeMark = btn.querySelector('.complete-mark');
                if (completeMark) {
                    btn.removeChild(completeMark);
                }
            });
        } catch (error) {
            console.error("Error resetting number pad:", error);
        }
    }

    /**
     * Restart the current game
     */
    restartGame() {
        try {
            // Reset player grid to initial puzzle
            this.playerGrid = this.currentPuzzle.map(row => [...row]);
            
            // Reset game state
            this.selectedCell = null;
            this.hintsUsed = 0;
            this.mistakes = 0;
            this.correctMoves = 0;
            this.gameActive = true;
            
            // Reset mistake indicators
            this.updateMistakeIndicators();
            
            // Reset and start the timer
            this.resetTimer();
            this.startTimer();
            
            // Reset the score
            this.score = 0;
            this.ui.updateScore(this.score);
            
            // Update the UI
            this.ui.renderBoard();
            
            // Reset number pad completion marks
            this.resetNumberPad();
            
            // Show restart message
            this.showMessage('RESTARTED', 'Game restarted! Good luck!');
        } catch (error) {
            console.error("Error restarting game:", error);
        }
    }

    /**
     * Exit to level selection screen
     */
    exitToLevelSelect() {
        try {
            // Stop the timer
            this.stopTimer();
            
            // Reset game state
            this.gameActive = false;
            
            // Hide pause button when exiting game
            const pauseToggle = document.getElementById('pause-toggle');
            if (pauseToggle) {
                pauseToggle.style.display = 'none';
            }
            
            // Show level select screen and hide game screen
            const levelSelectScreen = document.getElementById('level-select-screen');
            const gameScreen = document.getElementById('game-screen');
            
            if (gameScreen) gameScreen.classList.add('hidden');
            if (levelSelectScreen) levelSelectScreen.classList.remove('hidden');
        } catch (error) {
            console.error("Error exiting to level select:", error);
        }
    }

    /**
     * Select a cell on the board
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    selectCell(row, col) {
        // Can't select cells if game is not active
        if (!this.gameActive) return;
        
        this.selectedCell = [row, col];
        this.ui.highlightCell(row, col);
        
        // Play sound
        this.sound.play('select');
    }

    /**
     * Enter a number in the selected cell
     * @param {number} number - Number to enter (0 for erasing)
     */
    enterNumber(number) {
        // Can't enter numbers if no cell is selected or game is not active
        if (!this.selectedCell || !this.gameActive) return;
        
        const [row, col] = this.selectedCell;
        
        // Can't modify given numbers
        if (this.currentPuzzle[row][col] !== 0) {
            this.sound.play('error');
            return;
        }
        
        // Update the player's grid
        this.playerGrid[row][col] = number;
        
        // Check if the entered number is correct
        if (number !== 0 && number !== this.solution[row][col]) {
            // Wrong move
            this.mistakes++;
            this.correctMoves = 0; // Reset consecutive correct moves
            
            // Update mistake indicators
            this.updateMistakeIndicators();
            
            // Reset score to base level score
            this.score = this.getBaseLevelScore();
            this.ui.updateScore(this.score);
            
            this.ui.showError(row, col);
            this.sound.play('error');
            
            // Check if max mistakes reached
            if (this.mistakes >= this.maxMistakes) {
                this.gameOver();
                return;
            }
        } else if (number !== 0) {
            // Correct move
            this.correctMoves++;
            
            // Calculate points based on consecutive correct moves and level
            let basePoints = this.getBaseLevelScore();
            let increment = 10 + (this.level - 1) * 20; // Increment increases by 20 for each level
            let points;
            
            if (this.correctMoves === 1) {
                // First correct move gets base level score
                points = basePoints;
            } else {
                // Subsequent correct moves get increasing points
                // For level 1: 100, 110, 120, 130...
                // For level 2: 150, 170, 190, 210...
                // For level 3: 200, 230, 260, 290...
                points = basePoints + (this.correctMoves - 1) * increment;
            }
            
            this.score += points;
            this.ui.updateScore(this.score);
            this.sound.play('correct');
            
            // Show floating score animation
            this.ui.showFloatingScore(row, col, `+${points}`);
            
            // Check if all instances of this number are placed
            if (number > 0) {
                this.checkNumberCompletion(number);
            }
        } else {
            this.sound.play('erase');
        }
        
        // Update the UI
        this.ui.updateCell(row, col);
        
        // Check if the puzzle is solved
        if (this.isPuzzleSolved()) {
            this.gameComplete();
        }
    }
    
    /**
     * Check if all instances of a number have been placed correctly
     * @param {number} number - The number to check (1-9)
     */
    checkNumberCompletion(number) {
        // Count how many times this number should appear in the solution
        let totalInstances = 0;
        let correctInstances = 0;
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.solution[row][col] === number) {
                    totalInstances++;
                    if (this.playerGrid[row][col] === number) {
                        correctInstances++;
                    }
                }
            }
        }
        
        // If all instances are placed correctly, update the number pad
        if (totalInstances === correctInstances && totalInstances === 9) {
            this.ui.markNumberComplete(number);
        }
    }

    /**
     * Update the mistake indicators
     */
    updateMistakeIndicators() {
        try {
            for (let i = 1; i <= this.maxMistakes; i++) {
                const indicator = document.getElementById(`mistake-${i}`);
                if (indicator) {
                    if (i <= this.mistakes) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                }
            }
        } catch (error) {
            console.error("Error updating mistake indicators:", error);
        }
    }

    /**
     * Handle game over due to too many mistakes
     */
    gameOver() {
        try {
            // Stop the timer
            this.stopTimer();
            
            // Game is no longer active
            this.gameActive = false;
            
            // Hide pause button when game is over
            const pauseToggle = document.getElementById('pause-toggle');
            if (pauseToggle) {
                pauseToggle.style.display = 'none';
            }
            
            // Play error sound
            this.sound.play('error');
            
            // Show game over message
            this.showMessage(
                'GAME OVER!', 
                `You made ${this.maxMistakes} mistakes! Game over.\n\n` +
                `Final Score: ${this.score}\n\n` +
                `Would you like to try again or select a different level?`,
                () => {
                    // Show level select screen and hide game screen
                    const levelSelectScreen = document.getElementById('level-select-screen');
                    const gameScreen = document.getElementById('game-screen');
                    
                    if (gameScreen) gameScreen.classList.add('hidden');
                    if (levelSelectScreen) levelSelectScreen.classList.remove('hidden');
                }
            );
        } catch (error) {
            console.error("Error handling game over:", error);
        }
    }

    /**
     * Give a hint by revealing a random cell
     */
    giveHint() {
        // Can't give hints if game is not active
        if (!this.gameActive) return;
        
        // Limit to 2 hints per game
        if (this.hintsUsed >= 2) {
            this.showMessage('HINT LIMIT REACHED', 'You can only use 2 hints per game!');
            return;
        }
        
        try {
            // Find empty cells
            const emptyCells = [];
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (this.playerGrid[row][col] === 0) {
                        emptyCells.push([row, col]);
                    }
                }
            }
            
            // No empty cells left
            if (emptyCells.length === 0) return;
            
            // Select a random empty cell
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const [row, col] = emptyCells[randomIndex];
            
            // Fill in the correct number
            this.playerGrid[row][col] = this.solution[row][col];
            
            // Update the UI
            this.ui.updateCell(row, col);
            this.ui.highlightHint(row, col);
            
            // Update game state
            this.hintsUsed++;
            this.correctMoves = 0; // Reset consecutive correct moves
            
            // Penalty for using a hint - lose points based on level
            const penalty = 50 * this.level;
            this.score = Math.max(0, this.score - penalty);
            this.ui.updateScore(this.score);
            
            // Play hint sound
            this.sound.play('hint');
            
            // Check if the puzzle is solved
            if (this.isPuzzleSolved()) {
                this.gameComplete();
            }
        } catch (error) {
            console.error("Error giving hint:", error);
        }
    }

    /**
     * Solve the entire puzzle
     */
    solveGame() {
        // Can't solve if game is not active
        if (!this.gameActive) return;
        
        try {
            // Ask for confirmation
            this.showMessage('GIVE UP?', 'Are you sure you want to see the solution? Your score will be reset to zero.', () => {
                // Fill in the entire solution
                this.playerGrid = this.solution.map(row => [...row]);
                
                // Update the UI
                this.ui.renderBoard();
                
                // Reset score
                this.score = 0;
                this.ui.updateScore(this.score);
                
                // Stop the timer
                this.stopTimer();
                
                // Game is no longer active
                this.gameActive = false;
                
                // Hide pause button when game is solved
                const pauseToggle = document.getElementById('pause-toggle');
                if (pauseToggle) {
                    pauseToggle.style.display = 'none';
                }
                
                // Play solve sound
                this.sound.play('solve');
                
                // Show message
                this.showMessage('PUZZLE SOLVED', 'Here\'s the complete solution. Try again with a new puzzle!');
            });
        } catch (error) {
            console.error("Error solving game:", error);
        }
    }

    /**
     * Check if the puzzle is completely and correctly solved
     * @returns {boolean} - True if solved
     */
    isPuzzleSolved() {
        try {
            // Check if all cells are filled
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (this.playerGrid[row][col] === 0) {
                        return false;
                    }
                    if (this.playerGrid[row][col] !== this.solution[row][col]) {
                        return false;
                    }
                }
            }
            return true;
        } catch (error) {
            console.error("Error checking if puzzle is solved:", error);
            return false;
        }
    }

    /**
     * Handle game completion
     */
    gameComplete() {
        try {
            // Stop the timer
            this.stopTimer();
            
            // Calculate final score
            const timeBonus = this.calculateTimeBonus();
            const levelBonus = this.calculateLevelBonus();
            const finalScore = this.score + timeBonus + levelBonus;
            
            // Update the score
            this.score = finalScore;
            this.ui.updateScore(this.score);
            
            // Save score to local storage
            this.saveScore(finalScore);
            
            // Get score history
            const scoreHistory = this.getScoreHistory();
            
            // Game is no longer active
            this.gameActive = false;
            
            // Hide pause button when game is complete
            const pauseToggle = document.getElementById('pause-toggle');
            if (pauseToggle) {
                pauseToggle.style.display = 'none';
            }
            
            // Play victory sound
            this.sound.play('victory');
            
            // Get level name
            const levelName = this.getLevelName(this.level);
            
            // Show completion message with score history
            this.showMessage(
                'TOTALLY RADICAL!', 
                `You conquered ${levelName} in ${this.formatTime(this.getElapsedTime())}!\n\n` +
                `Base Score: ${this.score - timeBonus - levelBonus}\n` +
                `Time Bonus: ${timeBonus}\n` +
                `Level Bonus: ${levelBonus}\n` +
                `Final Score: ${finalScore}\n\n` +
                `Current Score: ${finalScore}\n` +
                `Last Score: ${scoreHistory.lastScore}\n` +
                `Best Score: ${scoreHistory.bestScore}\n\n` +
                `Mistakes: ${this.mistakes}\n` +
                `Hints Used: ${this.hintsUsed}`,
                () => {
                    // Show level select screen and hide game screen
                    const levelSelectScreen = document.getElementById('level-select-screen');
                    const gameScreen = document.getElementById('game-screen');
                    
                    if (gameScreen) gameScreen.classList.add('hidden');
                    if (levelSelectScreen) levelSelectScreen.classList.remove('hidden');
                }
            );
        } catch (error) {
            console.error("Error handling game completion:", error);
        }
    }
    
    /**
     * Save score to local storage
     * @param {number} score - The score to save
     */
    saveScore(score) {
        try {
            // Get existing scores
            const scores = JSON.parse(localStorage.getItem('sudokuScores')) || {
                lastScore: 0,
                bestScore: 0,
                history: []
            };
            
            // Update scores
            scores.lastScore = score;
            if (score > scores.bestScore) {
                scores.bestScore = score;
            }
            
            // Add to history (keep last 10 scores)
            scores.history.unshift({
                score: score,
                level: this.level,
                levelName: this.getLevelName(this.level),
                date: new Date().toISOString(),
                mistakes: this.mistakes,
                hintsUsed: this.hintsUsed,
                time: this.getElapsedTime()
            });
            
            // Keep only the last 10 scores
            if (scores.history.length > 10) {
                scores.history = scores.history.slice(0, 10);
            }
            
            // Save back to local storage
            localStorage.setItem('sudokuScores', JSON.stringify(scores));
        } catch (error) {
            console.error("Error saving score:", error);
        }
    }
    
    /**
     * Get score history from local storage
     * @returns {Object} - Score history object
     */
    getScoreHistory() {
        try {
            // Get existing scores
            const scores = JSON.parse(localStorage.getItem('sudokuScores')) || {
                lastScore: 0,
                bestScore: 0,
                history: []
            };
            
            return {
                lastScore: scores.lastScore,
                bestScore: scores.bestScore,
                history: scores.history
            };
        } catch (error) {
            console.error("Error getting score history:", error);
            return {
                lastScore: 0,
                bestScore: 0,
                history: []
            };
        }
    }

    /**
     * Toggle game pause state
     */
    togglePause() {
        if (!this.gameActive) return;
        
        try {
            this.gamePaused = !this.gamePaused;
            
            if (this.gamePaused) {
                // Pause the game
                this.stopTimer();
                
                // Show pause overlay
                this.showPauseOverlay();
                
                // Play pause sound
                this.sound.play('pause');
            } else {
                // Resume the game
                this.resumeTimer();
                
                // Hide pause overlay
                this.hidePauseOverlay();
                
                // Play resume sound
                this.sound.play('resume');
            }
        } catch (error) {
            console.error("Error toggling pause:", error);
        }
    }
    
    /**
     * Show pause overlay
     */
    showPauseOverlay() {
        try {
            // Create pause overlay if it doesn't exist
            if (!document.getElementById('pause-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'pause-overlay';
                overlay.className = 'pause-overlay';
                
                const content = document.createElement('div');
                content.className = 'pause-content';
                
                const title = document.createElement('h2');
                title.textContent = 'GAME PAUSED';
                
                const message = document.createElement('p');
                message.textContent = 'Click the pause button again to resume';
                
                // Add a resume button for better UX
                const resumeButton = document.createElement('button');
                resumeButton.className = 'action-btn';
                resumeButton.textContent = 'RESUME';
                resumeButton.addEventListener('click', () => this.togglePause());
                
                content.appendChild(title);
                content.appendChild(message);
                content.appendChild(resumeButton);
                overlay.appendChild(content);
                
                document.body.appendChild(overlay);
            } else {
                document.getElementById('pause-overlay').classList.remove('hidden');
            }
            
            // Update pause button
            const pauseButton = document.getElementById('pause-toggle');
            if (pauseButton) {
                pauseButton.textContent = '▶️';
                pauseButton.title = 'Resume Game';
            }
        } catch (error) {
            console.error("Error showing pause overlay:", error);
        }
    }
    
    /**
     * Hide pause overlay
     */
    hidePauseOverlay() {
        try {
            const overlay = document.getElementById('pause-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
            }
            
            // Update pause button
            const pauseButton = document.getElementById('pause-toggle');
            if (pauseButton) {
                pauseButton.textContent = '⏸️';
                pauseButton.title = 'Pause Game';
            }
        } catch (error) {
            console.error("Error hiding pause overlay:", error);
        }
    }

    /**
     * Start the timer
     */
    startTimer() {
        try {
            this.startTime = Date.now();
            this.timerInterval = setInterval(() => {
                const elapsedTime = this.getElapsedTime();
                const timerElement = document.getElementById('timer');
                if (timerElement) {
                    timerElement.textContent = this.formatTime(elapsedTime);
                }
            }, 1000);
        } catch (error) {
            console.error("Error starting timer:", error);
        }
    }

    /**
     * Stop the timer
     */
    stopTimer() {
        try {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                // Store the elapsed time when paused
                if (this.gamePaused) {
                    this.pausedTime = Date.now() - this.startTime;
                }
            }
        } catch (error) {
            console.error("Error stopping timer:", error);
        }
    }

    /**
     * Reset the timer
     */
    resetTimer() {
        try {
            this.stopTimer();
            const timerElement = document.getElementById('timer');
            if (timerElement) {
                timerElement.textContent = '00:00';
            }
        } catch (error) {
            console.error("Error resetting timer:", error);
        }
    }
    
    /**
     * Resume timer after pause
     */
    resumeTimer() {
        try {
            this.startTime = Date.now() - this.pausedTime;
            this.timerInterval = setInterval(() => {
                const elapsedTime = this.getElapsedTime();
                const timerElement = document.getElementById('timer');
                if (timerElement) {
                    timerElement.textContent = this.formatTime(elapsedTime);
                }
            }, 1000);
        } catch (error) {
            console.error("Error resuming timer:", error);
        }
    }

    /**
     * Get the elapsed time in seconds
     * @returns {number} - Elapsed time in seconds
     */
    getElapsedTime() {
        try {
            return Math.floor((Date.now() - this.startTime) / 1000);
        } catch (error) {
            console.error("Error getting elapsed time:", error);
            return 0;
        }
    }

    /**
     * Format time in MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    formatTime(seconds) {
        try {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error("Error formatting time:", error);
            return "00:00";
        }
    }

    /**
     * Get the base score for the current level
     * @returns {number} - Base score
     */
    getBaseLevelScore() {
        // Base score increases by 50 for each level
        // Level 1: 100
        // Level 2: 150
        // Level 3: 200
        // etc.
        return 100 + (this.level - 1) * 50;
    }

    /**
     * Calculate time bonus based on how quickly the puzzle was solved
     * @returns {number} - Time bonus points
     */
    calculateTimeBonus() {
        try {
            const elapsedTime = this.getElapsedTime();
            let timeLimit;
            
            // Adjust time limit based on level
            timeLimit = 300 + (this.level - 1) * 60; // 5 minutes for level 1, +1 minute per level
            
            if (elapsedTime <= timeLimit) {
                return Math.floor((1 - elapsedTime / timeLimit) * (500 + this.level * 100));
            }
            return 0;
        } catch (error) {
            console.error("Error calculating time bonus:", error);
            return 0;
        }
    }

    /**
     * Calculate level bonus
     * @returns {number} - Level bonus points
     */
    calculateLevelBonus() {
        return this.level * 200;
    }

    /**
     * Show a message in the message box
     * @param {string} title - Message title
     * @param {string} text - Message text
     * @param {Function} callback - Optional callback when message is closed
     */
    showMessage(title, text, callback = null) {
        try {
            const titleElement = document.getElementById('message-title');
            const textElement = document.getElementById('message-text');
            const messageBox = document.getElementById('message-box');
            
            if (titleElement) titleElement.textContent = title;
            if (textElement) textElement.textContent = text;
            if (messageBox) messageBox.classList.remove('hidden');
            
            // Set up callback if provided
            if (callback) {
                const closeButton = document.getElementById('message-close');
                if (closeButton) {
                    const oldCallback = closeButton.onclick;
                    
                    closeButton.onclick = () => {
                        if (messageBox) messageBox.classList.add('hidden');
                        callback();
                        closeButton.onclick = oldCallback;
                    };
                }
            }
        } catch (error) {
            console.error("Error showing message:", error);
        }
    }

    /**
     * Update the level indicator stars
     */
    updateLevelIndicator() {
        try {
            const stars = document.querySelectorAll('.level-star');
            
            stars.forEach((star, index) => {
                if (index < this.level) {
                    star.classList.remove('empty');
                } else {
                    star.classList.add('empty');
                }
            });
        } catch (error) {
            console.error("Error updating level indicator:", error);
        }
    }
    
    /**
     * Generate a puzzle based on the current level
     */
    generatePuzzleForLevel() {
        try {
            let difficulty;
            
            // Map level to difficulty
            if (this.level <= 2) {
                difficulty = 'easy';
            } else if (this.level <= 5) {
                difficulty = 'medium';
            } else if (this.level <= 8) {
                difficulty = 'hard';
            } else {
                difficulty = 'expert';
            }
            
            console.log(`Generating puzzle for level ${this.level}, difficulty: ${difficulty}`);
            
            // Generate the puzzle with appropriate cell removal based on level
            return this.generator.generate(difficulty, this.level);
        } catch (error) {
            console.error("Error generating puzzle for level:", error);
            // Return a simple default puzzle as fallback
            return {
                puzzle: Array(9).fill().map(() => Array(9).fill(0)),
                solution: Array(9).fill().map((_, i) => Array(9).fill().map((_, j) => ((i * 3 + Math.floor(i / 3) + j) % 9) + 1))
            };
        }
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing game");
    try {
        const game = new SudokuGame();
    } catch (error) {
        console.error("Error initializing game:", error);
    }
});
