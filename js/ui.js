/**
 * RADICAL SUDOKU EXTREME - UI Manager
 * Handles all UI updates and rendering
 */

class SudokuUI {
    constructor(game) {
        this.game = game;
        this.board = document.getElementById('game-board');
    }
    
    /**
     * Render the entire game board
     */
    renderBoard() {
        // Clear the board
        if (this.board) {
            this.board.innerHTML = '';
        } else {
            console.error("Game board element not found");
            return;
        }
        
        // Create cells
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                // Add border classes for 3x3 grid separation
                if (row % 3 === 0) cell.classList.add('border-top');
                if (row % 3 === 2) cell.classList.add('border-bottom');
                if (col % 3 === 0) cell.classList.add('border-left');
                if (col % 3 === 2) cell.classList.add('border-right');
                
                // Add row and column data attributes
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add click event listener
                cell.addEventListener('click', () => {
                    this.game.selectCell(row, col);
                });
                
                // Add the cell to the board
                this.board.appendChild(cell);
                
                // Update the cell content
                this.updateCell(row, col);
            }
        }
    }
    
    /**
     * Update a single cell on the board
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    updateCell(row, col) {
        const cell = this.getCellElement(row, col);
        if (!cell) return;
        
        const value = this.game.playerGrid[row][col];
        
        // Clear the cell
        cell.textContent = '';
        cell.className = 'cell';
        
        // Add border classes for 3x3 grid separation
        if (row % 3 === 0) cell.classList.add('border-top');
        if (row % 3 === 2) cell.classList.add('border-bottom');
        if (col % 3 === 0) cell.classList.add('border-left');
        if (col % 3 === 2) cell.classList.add('border-right');
        
        // Add value if not empty
        if (value !== 0) {
            cell.textContent = value;
            
            // Add given class if it's a given number
            if (this.game.currentPuzzle[row][col] !== 0) {
                cell.classList.add('given');
            }
        }
        
        // Highlight the cell if it's selected
        if (this.game.selectedCell && 
            this.game.selectedCell[0] === row && 
            this.game.selectedCell[1] === col) {
            cell.classList.add('selected');
        }
    }
    
    /**
     * Get the DOM element for a cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {HTMLElement} - Cell element
     */
    getCellElement(row, col) {
        return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    }
    
    /**
     * Highlight a cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    highlightCell(row, col) {
        // Remove highlight from all cells
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected');
            cell.classList.remove('same-row');
            cell.classList.remove('same-col');
            cell.classList.remove('same-box');
            cell.classList.remove('same-value');
        });
        
        // Add selected class to the clicked cell
        const selectedCell = this.getCellElement(row, col);
        if (selectedCell) {
            selectedCell.classList.add('selected');
        }
        
        // Highlight same row, column, and box
        for (let i = 0; i < 9; i++) {
            // Same row
            const rowCell = this.getCellElement(row, i);
            if (rowCell) rowCell.classList.add('same-row');
            
            // Same column
            const colCell = this.getCellElement(i, col);
            if (colCell) colCell.classList.add('same-col');
            
            // Same box
            const boxStartRow = Math.floor(row / 3) * 3;
            const boxStartCol = Math.floor(col / 3) * 3;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const boxCell = this.getCellElement(boxStartRow + r, boxStartCol + c);
                    if (boxCell) boxCell.classList.add('same-box');
                }
            }
        }
        
        // Highlight same value
        const value = this.game.playerGrid[row][col];
        if (value !== 0) {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (this.game.playerGrid[r][c] === value) {
                        const valueCell = this.getCellElement(r, c);
                        if (valueCell) valueCell.classList.add('same-value');
                    }
                }
            }
        }
    }
    
    /**
     * Show error animation on a cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    showError(row, col) {
        const cell = this.getCellElement(row, col);
        if (!cell) return;
        
        // Add error class
        cell.classList.add('error');
        
        // Remove error class after animation
        setTimeout(() => {
            cell.classList.remove('error');
        }, 1000);
    }
    
    /**
     * Highlight a hint cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    highlightHint(row, col) {
        const cell = this.getCellElement(row, col);
        if (!cell) return;
        
        // Add hint class
        cell.classList.add('hint');
        
        // Remove hint class after animation
        setTimeout(() => {
            cell.classList.remove('hint');
        }, 2000);
    }
    
    /**
     * Update the score display
     * @param {number} score - Current score
     */
    updateScore(score) {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }
    
    /**
     * Show floating score animation
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {string} text - Text to display
     */
    showFloatingScore(row, col, text) {
        const cell = this.getCellElement(row, col);
        if (!cell) return;
        
        // Create floating score element
        const floatingScore = document.createElement('div');
        floatingScore.className = 'floating-score';
        floatingScore.textContent = text;
        
        // Position it over the cell
        const cellRect = cell.getBoundingClientRect();
        floatingScore.style.left = `${cellRect.left + cellRect.width / 2}px`;
        floatingScore.style.top = `${cellRect.top}px`;
        
        // Add to document
        document.body.appendChild(floatingScore);
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(floatingScore);
        }, 1500);
    }
    
    /**
     * Mark a number as complete in the number pad
     * @param {number} number - The completed number (1-9)
     */
    markNumberComplete(number) {
        try {
            // Find the number button in the number pad
            const numberBtn = document.querySelector(`.number-btn[data-number="${number}"]`);
            if (numberBtn) {
                // Add a completed class
                numberBtn.classList.add('completed');
                
                // Add a visual indicator that the number is complete
                const completeMark = document.createElement('div');
                completeMark.className = 'complete-mark';
                completeMark.textContent = '✓';
                numberBtn.appendChild(completeMark);
                
                // Play a special sound for completing a number
                if (this.game.sound) {
                    this.game.sound.play('correct');
                }
            }
        } catch (error) {
            console.error("Error marking number complete:", error);
        }
    }
}
